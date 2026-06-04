const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const authenticateUser = require("./utils/authenticateUser");
const { publishToQueue } = require("./services/rabbit");
const validateRideAccess = require("./socket/utils/validateRideAccess");
const getCallParticipants = require("./socket/utils/getCallParticipants");
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

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const user = await authenticateUser(token);
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth error:", err);

      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    const userId = socket.user._id;
    const userType = socket.user.role;

    socket.join(`${userType}:${userId}`);
    console.log(
      `Socket ${userId}
     joined ${userType}:${userId}`,
    );
    // socket.on("join", async ({ userType, userId }) => {
    //   try {
    //     // personal stable room
    //     socket.join(`${userType}:${userId}`);

    //     console.log(`Socket ${socket.id} joined ${userType}:${userId}`);

    //     const queue = userType === "user" ? "update-user" : "captain-update";

    //     await publishToQueue(queue, {
    //       _id: userId,
    //       updateData: {
    //         socketId: socket.id,
    //       },
    //     });
    //   } catch (err) {
    //     console.error("Join error:", err);

    //     socket.emit("error", {
    //       message: "Join failed",
    //     });
    //   }
    // });

    // rideRoom
    socket.on("join-ride-room", async (rideId, callback) => {
      try {
        if (!rideId) {
          return socket.emit("error", {
            message: "Ride ID required",
          });
        }

        const isAllowed = await validateRideAccess(rideId, userId);

        if (!isAllowed) {
          return socket.emit("error", {
            message: "You are not allowed to join this room",
          });
        }

        const roomName = `ride:${rideId}`;

        await socket.join(roomName);

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

    // captain location update
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
          const isAllowed = await validateRideAccess(rideId, userId);

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
    socket.on("call-user", async ({ rideId }) => {
      const participants = await getCallParticipants(rideId, socket);

      if (!participants) return;

      const { callerId, receiverId } = participants;

      if (rideId)
        io.to(`ride:${rideId}`).emit("incoming-call", {
          rideId,
          callerId,
          receiverId,
        });
    });

    socket.on("accept-call", async ({ rideId }) => {
      const participants = await getCallParticipants(rideId, socket);

      if (!participants) return;

      const { callerId, receiverId } = participants;

      if (rideId)
        io.to(`ride:${rideId}`).emit("call-accepted", {
          rideId,
          callerId,
          receiverId,
        });
    });

    socket.on("reject-call", async ({ rideId }) => {
      const participants = await getCallParticipants(rideId, socket);

      if (!participants) return;

      const { callerId, receiverId } = participants;

      if (rideId)
        io.to(`ride:${rideId}`).emit("call-rejected", {
          rideId,
          callerId,
          receiverId,
        });
    });

    socket.on("end-call", async ({ rideId }) => {
      const participants = await getCallParticipants(rideId, socket);

      if (!participants) return;

      const { callerId, receiverId } = participants;

      if (rideId)
        io.to(`ride:${rideId}`).emit("call-ended", {
          rideId,
          callerId,
          receiverId,
        });
    });
  });
}

function sendMessageToSocketId(socketKey, event, message) {
  if (!io) return console.error("Socket not initialized");
  console.log("inside send message to socket id", socketKey, event, message);
  io.to(socketKey).emit(event, message);
}

module.exports = { initializeSocket, sendMessageToSocketId };
