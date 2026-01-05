"use client";

import { useEffect } from "react";
import { getSocket } from "../utils/socket";

export default function useFriendSocket(
  userId,
  username,
  avatar,
  callbacks = {}
) {
  const {
    onRequestReceived = () => {},
    onRequestAccepted = () => {},
  } = callbacks;

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    // Register user with backend
    socket?.emit("user:connect", {
      userId,
      username,
      avatar,
    });

    console.log("🟢 User connected via socket:", { userId, username });

    // Listen for incoming friend requests
    socket?.on("friend:request:received", (data) => {
      console.log("🔔 Friend request received:", data);
      onRequestReceived(data);
    });

    // Listen for accepted requests
    socket?.on("friend:request:accepted", (data) => {
      console.log("🎉 Friend request accepted:", data);
      onRequestAccepted(data);
    });

    // Cleanup
    return () => {
      socket?.off("friend:request:received");
      socket?.off("friend:request:accepted");
    };
  }, [userId, username, avatar, onRequestReceived, onRequestAccepted]);
}
