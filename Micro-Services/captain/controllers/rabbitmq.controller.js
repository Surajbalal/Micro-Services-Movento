const captainModel =
require("../models/captain.model");

const blackListTokenModel =
require("../models/blackListToken.model");

const {
   sendMessageToSocketId
} = require("../socket");

const isBlackListCaptain =
async (data, queue) => {

   console.log(
      "recieved",
      queue
   );

   return await blackListTokenModel
      .findOne({
         token: data.token
      })
      .lean();
};

const getCaptain =
async (data, queue) => {

   console.log(
      "recieved",
      queue,
      data._id
   );

   const response =
      await captainModel.findOne({
         _id: data._id
      }).lean();

   console.log(
      "response",
      response
   );

   return response;
};

const notificationRideEnded =
async (data) => {

   const captain =
      await captainModel
         .findById(data.captainId)
         .select("socketId")
         .lean();

   if (captain?.socketId) {

      sendMessageToSocketId(

         captain.socketId,

         "ride-ended",

         data.message
      );
   }

   return {
      success: true
   };
};

const getCaptainInTheRadius =
async (data) => {

   console.log(
      "Processing get-captainInTheRadius for:",
      data
   );

   const response =
      await captainModel.find({

         status: "active",

         isAvailable: true,

         "vehicle.vehicleType":
            data.vehicleType.toLowerCase(),

         location: {

            $near: {

               $geometry: {

                  type: "Point",

                  coordinates: [
                     data.lng,
                     data.lat
                  ]
               },

               $maxDistance:
                  data.radius * 1000
            }
         }
      })
      .select("_id socketId")
      .limit(10)
      .lean();

   console.log(
      "Query response:",
      response
   );

   return response;
};

const updateCaptain =
async (data) => {

   await captainModel
      .findByIdAndUpdate(

         data._id,

         {
            $set:
               data.updateData
         },

         {
            new: true
         }
      );

   return {
      success: true
   };
};

const rideCancelled =
async (data) => {

   await captainModel.updateOne(

      {
         _id: data.captainId
      },

      {
         $set: {
            isAvailable: true
         }
      }
   );

   return {
      success: true
   };
};

const createCaptain =
async (data, queue) => {

   try {

      console.log(
         "recieved",
         queue
      );

      const existingCaptain =
         await captainModel.findOne({
            email: data.email
         });

      if (existingCaptain) {

         console.log(
            "captain already exists",
            existingCaptain
         );

         return {
            success: true,
            message:
               "Captain already exists"
         };
      }

      console.log(
         "creating captain",
         data
      );

      const res =
         await captainModel.create({

            _id: data.captainId,

            fullName: {

               firstName:
                  data.firstName,

               lastName:
                  data.lastName || ""
            },

            email: data.email,

            vehicle: data.vehicle,

            location: {
               type: "Point",
               coordinates: [0, 0]
            }
         });

      console.log(
         "Synced new captain from Auth:",
         data.email
      );

      if (!res) {

         console.log(
            "captain not created"
         );

      } else {

         console.log(
            "captain created successfully:",
            res
         );
      }

      return {
         success: true
      };

   } catch (err) {

      console.error(
         "Failed to sync captain:",
         err.message
      );

      return {
         success: false,
         error: err.message
      };
   }
};

module.exports = {

   isBlackListCaptain,

   getCaptain,

   notificationRideEnded,

   getCaptainInTheRadius,

   updateCaptain,

   rideCancelled,

   createCaptain
}; 