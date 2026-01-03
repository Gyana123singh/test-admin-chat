"use client";

import { useEffect } from "react";
import { getSocket } from "../utils/socket";

export default function useFriendSocket(userId, username, avatar, callbacks = {}) {
  const {
    onRequestReceived = null,
    onRequestAccepted = null,
    onError = null,
  } = callbacks;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    
    if (!token || !userId) {
      console.warn("❌ Token or userId missing");
      return;
    }

    const socket = getSocket(token);

    socket?.emit("user:connect", {
      userId,
      username,
      avatar,
    });

    const handleRequestReceived = (data) => {
      console.log("🔔 Friend request received:", data);
      if (onRequestReceived) {
        onRequestReceived(data);
      }
    };

    const handleRequestAccepted = (data) => {
      console.log("🎉 Friend request accepted:", data);
      if (onRequestAccepted) {
        onRequestAccepted(data);
      }
    };

    const handleError = (error) => {
      console.error("❌ Socket error:", error);
      if (onError) {
        onError(error);
      }
    };

    socket?.on("friend:request:received", handleRequestReceived);
    socket?.on("friend:request:accepted", handleRequestAccepted);
    socket?.on("error", handleError);

    return () => {
      socket?.off("friend:request:received", handleRequestReceived);
      socket?.off("friend:request:accepted", handleRequestAccepted);
      socket?.off("error", handleError);
    };
  }, [userId, username, avatar, onRequestReceived, onRequestAccepted, onError]);
}
