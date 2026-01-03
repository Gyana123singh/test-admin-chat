"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getSocket } from "../utils/socket";

export default function AddFriend({ userId, username, avatar }) {
  const [toUserId, setToUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [token, setToken] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

  const handleSendRequest = async () => {
    if (!toUserId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (toUserId === userId) {
      setError("Cannot send request to yourself");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/friends/request`,
        { to: toUserId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Friend request sent via API:", response.data);

      const socket = getSocket(token);
      socket?.emit("friend:request:send", {
        toUserId,
      });

      console.log("✅ Socket event emitted to user:", toUserId);

      setSuccess("Friend request sent ✅");
      setToUserId("");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error sending request";
      setError(errorMsg);
      console.error("❌ Error:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold mb-3">Add Friend</h2>

      {error && (
        <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 bg-green-100 text-green-700 rounded text-sm">
          {success}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter user ID"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendRequest()}
          disabled={loading}
          className="flex-1 px-3 py-2 border rounded text-sm disabled:bg-gray-200"
        />

        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? "Sending..." : "Add Friend"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        💡 Enter the user ID of the person you want to add
      </p>
    </div>
  );
}
