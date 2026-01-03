// import { io } from "socket.io-client";

// let socket = null;

// const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

// export const getSocket = (token) => {
//   // ✅ Prevent SSR execution
//   if (typeof window === "undefined") return null;

//   if (!socket) {
//     socket = io(SOCKET_URL, {
//       transports: ["websocket"],
//       autoConnect: false,
//       withCredentials: true,
//       auth: token ? { token } : undefined,
//     });
//   }

//   return socket;
// };

import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const getSocket = (token) => {
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: token ? { token } : undefined,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = (token) => {
  disconnectSocket();
  return getSocket(token);
};

