"use client";

import { useEffect } from "react";
import { getSocket } from "../utils/socket";

export default function useFriendSocket(onReceive) {
  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = getSocket(token);

    socket.connect();

    socket.on("friend:request:received", (data) => {
      onReceive(data);
    });

    socket.on("friend:request:accepted", (data) => {
      alert(`🎉 ${data.fromUsername} accepted your request`);
    });

    return () => {
      socket.off("friend:request:received");
      socket.off("friend:request:accepted");
    };
  }, []);
}
