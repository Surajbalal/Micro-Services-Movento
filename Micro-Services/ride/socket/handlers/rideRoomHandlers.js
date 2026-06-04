const validateRideAccess = require("../utils/validateRideAccess");
module.exports = function (io, socket) {
  console.log("-------------inside ride room handlers-----------------");
  socket.on("join-ride-room", async (rideId, callback) => {
    console.log(
      "-------------inside ride room handlers-----------------",
      rideId,
    );
    try {
      if (!rideId) {
        return socket.emit("error", {
          message: "Ride ID required",
        });
      }
      console.log("ride iddddddd", rideId);
      console.log("socket user iddddddd", socket.user._id);

      const isAllowed = await validateRideAccess(rideId, socket.user._id);
      console.log("isAllowed", isAllowed);
      if (!isAllowed) {
        console.log("----------not allowed-----------");
        return socket.emit("error", {
          message: "You are not allowed to join this room",
        });
      }

      const roomName = `ride:${rideId}`;
      console.log("room name", roomName);

      await socket.join(roomName);

      const sockets = await io.in(roomName).fetchSockets();
      console.log("sockets inside room", sockets.length);
      console.log("CONNECTED ROLE:", socket.user.role);

      callback?.({
        success: true,
      });
      console.log(`Socket ${socket.id} joined ${roomName}`);
    } catch (err) {
      console.error(err);

      socket.emit("error", {
        message: "Join room failed",
      });
    }
  });
  socket.on("leave-ride-room", async (rideId) => {
    const userId = socket.user._id;

    const isAllowed = await validateRideAccess(rideId, userId);

    if (!isAllowed) {
      return socket.emit("error", {
        message: "You are not allowed to join this room",
      });
    }

    socket.leave(`ride:${rideId}`);
  });
};
