const getCallParticipants = require("../utils/getCallParticipants");

module.exports = function (io, socket) {
        // --- Call Signaling Events ---
    socket.on("call-user", async ( rideId ) => {
         console.log("CALL USER RECEIVED", rideId);
      const participants = await getCallParticipants(rideId, socket);

      if (!participants) return;
  console.log("PARTICIPANTS", participants);

      const { callerId, receiverId } = participants;

      if (rideId)
        io.to(`ride:${rideId}`).emit("incoming-call", {
          rideId,
          callerId,
          receiverId,
        });
          console.log("INCOMING CALL EMITTED");
    });

    socket.on("accept-call", async ( rideId ) => {
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

    socket.on("reject-call", async ( rideId ) => {
          console.log("REJECT DATA:", rideId);

      const participants = await getCallParticipants(rideId, socket);
 console.log("PARTICIPANTS", participants);
      if (!participants) return;

      const { callerId, receiverId } = participants;
        console.log(callerId,receiverId,rideId,"inside reject call");
      if (rideId)
        io.to(`ride:${rideId}`).emit("call-rejected", {
          rideId,
          callerId,
          receiverId,
        });
            console.log("call rejected emit")
    });

    socket.on("end-call", async ( rideId ) => {
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
    }