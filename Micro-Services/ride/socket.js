const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const { publishToQueue } = require("./services/rabbit");
const {auth} = require("./middlewares/auth.middleware")

let io;

async function initializeSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
      pingTimeout: 20000,
  pingInterval: 25000,
  });

  // Redis adapter for scaling
  const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = auth({token})
    console.log(decoded)

    next();
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // join event (user or captain)
    socket.on("join", async ({ userType, userId }) => {
      try {
        // personal stable room
        socket.join(`${userType}:${userId}`);

        console.log(`Socket ${socket.id} joined ${userType}:${userId}`);

        const queue = userType === "user" ? "update-user" : "captain-update";

        await publishToQueue(queue, {
          _id: userId,
          updateData: {
            socketId: socket.id,
          },
        });
      } catch (err) {
        console.error("Join error:", err);

        socket.emit("error", {
          message: "Join failed",
        });
      }
    });

    // rideRoom
    socket.on("join-ride-room", async (rideId,callback) => {
      try {
        if (!rideId) {
          return socket.emit("error", {
            message: "Ride ID required",
          });
        }

        const roomName = `ride:${rideId}`;

        await socket.join(roomName);

        callback({
          success:true
        });
        console.log(`Socket ${socket.id} joined ${roomName}`);
      } catch (err) {
        console.error(err);

        socket.emit("error", {
          message: "Join room failed",
        });
      }
    });
    socket.on("leave-ride-room", (rideId) => socket.leave(`ride:${rideId}`));

    // captain location update
    socket.on(
      "update-captain-location",
      async ({ location, captainId, rideId }) => {
        if (!location?.lat || !location?.lng) {
          return socket.emit("error", { message: "Invalid location" });
        }

        await publishToQueue("captain-update", {
          _id: captainId,
          updateData: {
            location: {
              type: "Point",
              coordinates: [location.lng, location.lat],
            },
          },
        });

        if (rideId)
          io.to(`ride:${rideId}`).emit("captain-live-location", location);
      },
    );

    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected because: ${reason}`);
    });
    socket.on("debug-room", async (rideId) => {
      const roomName = `ride:${rideId}`;

      const sockets = await io.in(roomName).fetchSockets();

      console.log("Users count:", sockets.length);
      console.log(
        "Socket IDs:",
        sockets.map((s) => s.id),
      );

      // if (room) {
      //   console.log("Users count:", room.size);
      //   console.log("Socket IDs:", [...room]);
      // } else {
      //   console.log("Room does not exist");
      // }
    });

    // --- Call Signaling Events ---
    socket.on("call-user", ({ rideId, callerId, receiverId }) => {
      console.log(
        `Call initiated by ${callerId} for ${receiverId} in ride: ${rideId}`,
      );
      if (rideId)
        io.to(`ride:${rideId}`).emit("incoming-call", {
          rideId,
          callerId,
          receiverId,
        });
    });

    socket.on("accept-call", ({ rideId, callerId, receiverId }) => {
      console.log(
        `Call accepted by ${receiverId} for ${callerId} in ride: ${rideId}`,
      );
      if (rideId)
        io.to(`ride:${rideId}`).emit("call-accepted", {
          rideId,
          callerId,
          receiverId,
        });
    });

    socket.on("reject-call", ({ rideId, callerId, receiverId }) => {
      console.log(
        `Call rejected by ${receiverId} for ${callerId} in ride: ${rideId}`,
      );
      if (rideId)
        io.to(`ride:${rideId}`).emit("call-rejected", {
          rideId,
          callerId,
          receiverId,
        });
    });

    socket.on("end-call", ({ rideId, callerId, receiverId }) => {
      console.log(`Call ended in ride: ${rideId}`);
      if (rideId)
        io.to(`ride:${rideId}`).emit("call-ended", {
          rideId,
          callerId,
          receiverId,
        });
    });
  });
}

function sendMessageToSocketId(socketId, event, message) {
  if (!io) return console.error("Socket not initialized");
  console.log("inside send message to socket id", socketId, event, message);
  io.to(socketId).emit(event, message);
}

module.exports = { initializeSocket, sendMessageToSocketId };
