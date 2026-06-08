const  axios  = require("axios");
const { error } = require("console");

const { publishToQueue } = require("./rabbit");
const rideModel = require("../models/ride.model");
const AppError = require("../utils/appError");

const apiKey = process.env.GOOGLE_MAPS_API;

module.exports.getAddressCoordinates = async(address) => {
  try {
    const url = "https://maps.googleapis.com/maps/api/geocode/json";

    const response = await axios.get(url, {
      params: {
        address: address,
        key: apiKey,
      },
    });
    if (response.data.status !== "OK") {
      throw new AppError(response.data.status, "MAPS_API_ERROR", 500);
    }

    const location = response.data.results[0].geometry.location;

    return {
      lat: location.lat,
      lng: location.lng,
    };

  } catch (error) {
    console.error("Error fetching coordinates:", error.message);

    if (error instanceof AppError) throw error;
    throw new AppError("Unable to fetch coordinates for this address", "GEOCODE_ERROR", 500);
  }
}
module.exports.getDistanceTime = async (origin, destination)=> {
  console.log("origin",origin);
  console.log("destination",destination);
  console.log("apiKey",apiKey);
   const url = "https://maps.googleapis.com/maps/api/distancematrix/json";

const params = {
  origins: origin,
  destinations: destination,
  key: apiKey
}

  try {
    const response = await axios.get(url, { params });

    const data = response.data;

    console.log("Google Response:", JSON.stringify(data, null, 2));

    if (response.status !== 200) {
      throw new AppError(
        "Request failed",
        "MAPS_API_ERROR",
        500
      );
    }

    if (
      !data.rows ||
      !data.rows[0] ||
      !data.rows[0].elements ||
      !data.rows[0].elements[0]
    ) {
      throw new AppError(
        data.error_message || "Invalid Google Maps response",
        "MAPS_API_ERROR",
        500
      );
    }

    const element = data.rows[0].elements[0];

    if (data.status !== "OK" || element.status !== "OK") {
      throw new AppError(
        "Invalid origin or destination",
        "INVALID_LOCATION",
        400
      );
    }
    return element;
  } catch (error) {
    console.error("Service error:", error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message, "MAPS_API_ERROR", 500); 
  }
}
module.exports.getAutoCompleteSuggestions = async(input)=>{
  if(!input){
    throw new AppError('Input is required', "BAD_REQUEST", 400);
  }
  try {
    console.log("apiKey",apiKey);
    const url = "https://maps.googleapis.com/maps/api/place/autocomplete/json";

    const response = await axios.get(url, {
      params: {
        input: input,
        key: apiKey,
      },
    });

  if (
   response.data.status !== "OK" &&
   response.data.status !== "ZERO_RESULTS"
) {

   console.log(response.data);

   throw new AppError(
      response.data.error_message || "Unable to fetch suggestions",
      "MAPS_API_ERROR",
      500
   );
}

    return response.data.predictions;
  } catch (error) {
    console.error("Error fetching address suggestions:", error.message);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message, "MAPS_API_ERROR", 500);
  }
}
module.exports.getCaptainInTheRadius = async (lat, lng, radius,vehicleType) => {
  try {

    console.log("Parameters received:", lat, lng, radius);

    // const captains = await captainModel.find({
    //   location: {
    //     $geoWithin: {
    //       $centerSphere: [[lng, lat], radius / 6371]
    //     }
    //   }
    // });
    const captains = await publishToQueue('get-captainInTheRadius',{lat, lng, radius,vehicleType})
    console.log("captains",captains);
    const busyCaptainsId = await rideModel.find({
      captain:{$in: captains.map(c => c._id)},
      status:{$in: ['accepted', 'ongoing']}
    }).select("captain");
    console.log("busyCaptainsId",busyCaptainsId);
    const busyCaptainsSet = new Set(
      busyCaptainsId.map(r => r.captain.toString())
    )
    const freeCaptains = captains.filter(captain => !busyCaptainsSet.has(captain._id.toString()));

    console.log("Captains inside radius:", captains);

    return freeCaptains;

  } catch (error) {
    console.error("Error in getCaptainInTheRadius:", error);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message, "RABBITMQ_ERROR", 500);
  }
};

module.exports.getRoutePolyline = async (origin, destination) => {
  if (!origin || !destination) {
    throw new AppError("Origin and destination are required", "BAD_REQUEST", 400);
  }

  const coordRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

  const parseLocation = (input) => {
    if (coordRegex.test(input)) {
      const [lat, lng] = input.split(',').map(Number);
      return {
        latLng: {
          latitude: lat,
          longitude: lng,
        },
      };
    } else {
      return {
        address: input,
      };
    }
  };

  const originLocation = parseLocation(origin);
  const destLocation = parseLocation(destination);

  try {
    const response = await axios.post(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        origin: { location: originLocation },
        destination: { location: destLocation },
        travelMode: "DRIVE",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey ? apiKey.trim() : "",
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
        },
      }
    );

    const routes = response.data?.routes;
    if (!routes || routes.length === 0) {
      throw new AppError("No routes found", "MAPS_API_ERROR", 404);
    }

    return {
      encodedPolyline: routes[0].polyline.encodedPolyline,
      distanceMeters: routes[0].distanceMeters,
      duration: routes[0].duration,
    };
  } catch (error) {
    console.error("Error computing route:", error.message);
    if (error instanceof AppError) throw error;
    throw new AppError("Unable to fetch route details", "MAPS_API_ERROR", 500);
  }
};

