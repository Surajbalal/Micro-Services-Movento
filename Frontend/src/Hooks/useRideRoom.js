import { useEffect } from "react";

export default function useRideRoom(socket, rideId) {
console.log("this is inside the useRideRoom",socket,rideId,socket?.id)


  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit("join-ride-room", rideId);
    console.log("Joined ride room:", rideId);

    return () => {
      socket.emit("leave-ride-room", rideId);
      console.log("Left ride room:", rideId);
    };

  }, [socket, rideId]);

}
