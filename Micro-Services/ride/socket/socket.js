const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
// NOTE: authenticateUser is required dynamically inside io.use() to avoid circular dependency
const callHandlers = require("./handlers/callHandlers");
const locationHandlers = require("./handlers/locationHandlers");
const rideRoomHandlers = require("./handlers/rideRoomHandlers");
let io;

async function initializeSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Redis adapter for scaling
  const pubClient = createClient({ url: "redis://redis:6379" });
  // const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      console.log(`[Socket Auth] Connection attempt from ${socket.id}, token present: ${!!token}, token prefix: ${token ? token.substring(0, 15) + '...' : 'N/A'}`);
      if (!token) return next(new Error("Authentication error"));

      // Dynamic require to break circular dependency
      const authenticateUser = require("../utils/authenticateUser");
      const user = await authenticateUser(token);
      socket.user = user;
      console.log(`[Socket Auth] SUCCESS — socket ${socket.id} authenticated as ${user.role}:${user._id}`);
      next();
    } catch (err) {
      console.error(`[Socket Auth] FAILED — socket ${socket.id}:`, err.message || err);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}, user: ${socket.user.role}:${socket.user._id}`);

    const userId = socket.user._id;
    const userType = socket.user.role;

    socket.join(`${userType}:${userId}`);
    console.log(`[Socket] ${socket.id} joined room ${userType}:${userId}`);
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] ${socket.id} (${userType}:${userId}) disconnected — reason: ${reason}`);
    });
    socket.on("debug-room", async (rideId) => {
        console.log("DEBUG ARG:", rideId);
      const roomName = `ride:${rideId}`;
      console.log(roomName);
      const sockets = await io.in(roomName).fetchSockets();
      console.log(roomName);
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

    //--- captain location update ---
    locationHandlers(io, socket);

    // --- ride related events ---
    rideRoomHandlers(io, socket);

    // --- Call Signaling Events ---
    callHandlers(io, socket);
  });
}

function sendMessageToSocketId(socketKey, event, message) {
  if (!io) return console.error("Socket not initialized");
  console.log("inside send message to socket id", socketKey, event, message);
  io.to(socketKey).emit(event, message);
}

module.exports = { initializeSocket, sendMessageToSocketId };
