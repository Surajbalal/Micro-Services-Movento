const getCallParticipants = require("../utils/getCallParticipants");

module.exports = function (io, socket) {
  // --- Call Signaling Events ---
  socket.on("call-user", async (rideId) => {
    console.log(`[Socket Call] call-user received for rideId: ${rideId} from socket: ${socket.id}`);
    const participants = await getCallParticipants(rideId, socket);

    if (!participants) {
      console.warn(`[Socket Call] call-user: getCallParticipants returned null for rideId: ${rideId}`);
      return;
    }
    console.log("[Socket Call] Participants:", participants);

    const { callerId, receiverId } = participants;
    const callerRole = socket.user.role; // "user" or "captain"
    const receiverRole = callerRole === "user" ? "captain" : "user";

    const receiverRoom = `${receiverRole}:${receiverId}`;
    const callerRoom = `${callerRole}:${callerId}`;

    const callerName = socket.user.fullName
      ? `${socket.user.fullName.firstName} ${socket.user.fullName.lastName || ""}`.trim()
      : socket.user.role === "captain" ? "Captain" : "User";

    console.log(`[Socket Call] call-user: Emitting incoming-call to receiverRoom: ${receiverRoom} and callerRoom: ${callerRoom}`);

    if (rideId) {
      io.to(receiverRoom).emit("incoming-call", {
        rideId,
        callerId,
        receiverId,
        callerName,
      });
      io.to(callerRoom).emit("incoming-call", {
        rideId,
        callerId,
        receiverId,
        callerName,
      });
      console.log("[Socket Call] incoming-call successfully emitted");
    }
  });

  socket.on("accept-call", async (rideId) => {
    console.log(`[Socket Call] accept-call received for rideId: ${rideId} from socket: ${socket.id}`);
    const participants = await getCallParticipants(rideId, socket);

    if (!participants) {
      console.warn(`[Socket Call] accept-call: getCallParticipants returned null for rideId: ${rideId}`);
      return;
    }

    const { callerId, receiverId } = participants;
    const callerRole = socket.user.role; // "user" or "captain"
    const receiverRole = callerRole === "user" ? "captain" : "user";

    const receiverRoom = `${receiverRole}:${receiverId}`;
    const callerRoom = `${callerRole}:${callerId}`;

    console.log(`[Socket Call] accept-call: Emitting call-accepted to receiverRoom: ${receiverRoom} and callerRoom: ${callerRoom}`);

    if (rideId) {
      io.to(receiverRoom).emit("call-accepted", {
        rideId,
        callerId,
        receiverId,
      });
      io.to(callerRoom).emit("call-accepted", {
        rideId,
        callerId,
        receiverId,
      });
      console.log("[Socket Call] call-accepted successfully emitted");
    }
  });

  socket.on("reject-call", async (rideId) => {
    console.log(`[Socket Call] reject-call received for rideId: ${rideId} from socket: ${socket.id}`);
    const participants = await getCallParticipants(rideId, socket);

    if (!participants) {
      console.warn(`[Socket Call] reject-call: getCallParticipants returned null for rideId: ${rideId}`);
      return;
    }

    const { callerId, receiverId } = participants;
    const callerRole = socket.user.role; // "user" or "captain"
    const receiverRole = callerRole === "user" ? "captain" : "user";

    const receiverRoom = `${receiverRole}:${receiverId}`;
    const callerRoom = `${callerRole}:${callerId}`;

    console.log(`[Socket Call] reject-call: Emitting call-rejected to receiverRoom: ${receiverRoom} and callerRoom: ${callerRoom}`);

    if (rideId) {
      io.to(receiverRoom).emit("call-rejected", {
        rideId,
        callerId,
        receiverId,
      });
      io.to(callerRoom).emit("call-rejected", {
        rideId,
        callerId,
        receiverId,
      });
      console.log("[Socket Call] call-rejected successfully emitted");
    }
  });

  socket.on("end-call", async (rideId) => {
    console.log(`[Socket Call] end-call received for rideId: ${rideId} from socket: ${socket.id}`);
    const participants = await getCallParticipants(rideId, socket);

    if (!participants) {
      console.warn(`[Socket Call] end-call: getCallParticipants returned null for rideId: ${rideId}`);
      return;
    }

    const { callerId, receiverId } = participants;
    const callerRole = socket.user.role; // "user" or "captain"
    const receiverRole = callerRole === "user" ? "captain" : "user";

    const receiverRoom = `${receiverRole}:${receiverId}`;
    const callerRoom = `${callerRole}:${callerId}`;

    console.log(`[Socket Call] end-call: Emitting call-ended to receiverRoom: ${receiverRoom} and callerRoom: ${callerRoom}`);

    if (rideId) {
      io.to(receiverRoom).emit("call-ended", {
        rideId,
        callerId,
        receiverId,
      });
      io.to(callerRoom).emit("call-ended", {
        rideId,
        callerId,
        receiverId,
      });
      console.log("[Socket Call] call-ended successfully emitted");
    }
  });
};