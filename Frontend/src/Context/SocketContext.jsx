import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(`${import.meta.env.VITE_BASE_URL}`);

        newSocket.on('connect', () => {
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
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
  socket.emit(eventName, message);
};
    // Function to receive a message from a specific event
  const receiveMessage = (eventName, callback) => {
    console.log("inside receive message",eventName,callback);
  if (!socket) {
    console.warn("⚠ Socket not initialized");
    return;
  }

  socket.on(eventName, callback);

  return () => {
    socket.off(eventName, callback);
  };
};


    return (
        <SocketContext.Provider value={{socket, sendMessage, receiveMessage }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider;