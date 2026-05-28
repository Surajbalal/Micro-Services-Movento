const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { publishToQueue } = require("./services/rabbitmq/publish");

let io;

async function initializeSocket(server) {

  io = new Server(server, {
    cors: { origin: "*" }
  });

  // Redis adapter for scaling
  const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  io.on("connection", (socket) => {

    console.log("Client connected:", socket.id);

    // join event (user or captain)
   socket.on("join", async ({ userType, userId }) => {

  try {

    // personal stable room
    socket.join(`${userType}:${userId}`);

    console.log(
      `Socket ${socket.id} joined ${userType}:${userId}`
    );

    const queue =
      userType === "user"
        ? "update-user"
        : "captain-update";

    await publishToQueue(queue, {
      _id: userId,
      updateData: {
        socketId: socket.id
      }
    });

  } catch (err) {

    console.error("Join error:", err);

    socket.emit("error", {
      message: "Join failed"
    });

  }

});

    // ride room
    socket.on("join-ride-room", async (rideId) => {
      await socket.join(String(rideId));
      console.log(`Socket ${socket.id} joined ride room ${rideId}`);
    });

    socket.on("leave-ride-room", (rideId) => socket.leave(rideId));
socket.on("debug-room", (rideId) => {
    const roomName = String(rideId);

  const room = io.sockets.adapter.rooms.get(roomName);

  if (room) {
    console.log("Users count:", room.size);
    console.log("Socket IDs:", [...room]);
  } else {
    console.log("Room does not exist");
  }
});
    // captain location update
    socket.on("update-captain-location", async ({ location, captainId, rideId }) => {

      if (!location?.lat || !location?.lng) {
        return socket.emit("error", { message: "Invalid location" });
      }

      await publishToQueue("captain-update", {
        _id: captainId,
        updateData: {
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat]
          }
        }
      });

      if (rideId) io.to(rideId).emit("captain-live-location", location);

    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    // --- Call Signaling Events ---
    socket.on("call-user", ({ rideId, callerId, receiverId }) => {
      console.log(`Call initiated by ${callerId} for ${receiverId} in ride: ${rideId}`);
      if (rideId) io.to(rideId).emit("incoming-call", { rideId, callerId, receiverId });
    });

    socket.on("accept-call", ({ rideId, callerId, receiverId }) => {
      console.log(`Call accepted by ${receiverId} for ${callerId} in ride: ${rideId}`);
      if (rideId) io.to(rideId).emit("call-accepted", { rideId, callerId, receiverId });
    });

    socket.on("reject-call", ({ rideId, callerId, receiverId }) => {
      console.log(`Call rejected by ${receiverId} for ${callerId} in ride: ${rideId}`);
      if (rideId) io.to(rideId).emit("call-rejected", { rideId, callerId, receiverId });
    });

    socket.on("end-call", ({ rideId, callerId, receiverId }) => {
      console.log(`Call ended in ride: ${rideId}`);
      if (rideId) io.to(rideId).emit("call-ended", { rideId, callerId, receiverId });
    });

  });

}

function sendMessageToSocketId(socketId, event, message) {
  if (!io) return console.error("Socket not initialized");
  console.log("inside send message to socket id",socketId,event,message);
  io.to(socketId).emit(event, message);
}

module.exports = { initializeSocket, sendMessageToSocketId };