import React, { createContext, useEffect, useState } from "react";
import { useCallback } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("captain-token");
    if (!token) return;
    // Initialize socket connection
    const newSocket = io(`${import.meta.env.VITE_BASE_URL}`, {
      auth: {
        token,
      },
    });
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
    });

    newSocket.on("connect", () => {
      console.log("Connected to server", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
    newSocket.io.on("reconnect", (attempt) => {
      console.log("Reconnected", attempt);
    });

    newSocket.io.on("reconnect_attempt", () => {
      console.log("Trying reconnect...");
    });

    setSocket(newSocket);
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("UPDATED SOCKET:", socket);
  }, [socket]);

  // Function to send a message to a specific event
  const sendMessage = (eventName, message) => {
    if (!socket) {
      console.warn("Socket not initialized");
      return;
    }
    console.log("sending message", eventName, message);
    socket.emit(eventName, message);
  };
  // Function to receive a message from a specific event
  const receiveMessage = useCallback(
    (eventName, callback) => {
      console.log("inside receive message", eventName, callback);
      if (!socket) {
        console.warn("⚠ Socket not initialized");
        return () => {};
      }

      socket.on(eventName, callback);

      return () => {
        socket.off(eventName, callback);
      };
    },
    [socket],
  );

  return (
    <SocketContext.Provider value={{ socket, sendMessage, receiveMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketProvider;
