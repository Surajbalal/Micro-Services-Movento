const { publishToQueue } = require("../../services/rabbit");
const validateRideAccess = require("../utils/validateRideAccess");

module.exports = function (io, socket){

         socket.on("update-captain-location", async ({ location, rideId }) => {
            try {
              if (!location?.lat || !location?.lng) {
                return socket.emit("error", {
                  message: "Invalid location",
                });
              }
    
              if (socket.user.role !== "captain") {
                return socket.emit("error", {
                  message: "Only captains allowed",
                });
              }
    
              const captainId = socket.user._id;
    
              await publishToQueue("captain-update", {
                _id: captainId,
                updateData: {
                  location: {
                    type: "Point",
                    coordinates: [location.lng, location.lat],
                  },
                },
              });
    
              if (rideId) {
                const isAllowed = await validateRideAccess(rideId, captainId);
    
                if (!isAllowed) {
                  return socket.emit("error", {
                    message: "You are not allowed to join this room",
                  });
                }
                io.to(`ride:${rideId}`).emit("captain-live-location", location);
              }
            } catch (err) {
              console.error(err);
            }
          });
    
}
