"use client";

import { useState } from "react";
import axios from "axios";
import { getSocket } from "../utils/socket";

export default function FriendRequestCard({
  request,
  token,
  currentUserId,
  onAccept,
  onReject,
}) {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleAccept = async () => {
    setLoading(true);
    setActionType("accept");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/friends/accept`,
        { requestId: request._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Friend request accepted via API:", response.data);

      const socket = getSocket(token);
      socket?.emit("friend:request:accept", {
        toUserId: request.from._id,
      });

      console.log("✅ Socket event emitted - request accepted");

      if (onAccept) {
        onAccept(request._id);
      }
    } catch (err) {
      console.error("❌ Error accepting request:", err);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setActionType("reject");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/friends/reject`,
        { requestId: request._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Friend request rejected via API:", response.data);

      if (onReject) {
        onReject(request._id);
      }
    } catch (err) {
      console.error("❌ Error rejecting request:", err);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={request.from.avatar || "/default-avatar.png"}
          alt={request.from.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">{request.from.username}</p>
          <p className="text-xs text-gray-500">
            📅 {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium transition"
        >
          {actionType === "accept" && loading ? "Accepting..." : "✓ Accept"}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition"
        >
          {actionType === "reject" && loading ? "Rejecting..." : "✕ Reject"}
        </button>
      </div>
    </div>
  );
}
