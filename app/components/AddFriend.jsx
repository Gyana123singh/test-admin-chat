"use client";

import { useState } from "react";
import axios from "axios";
import { getSocket } from "../utils/socket";

export default function AddFriend({
  token,
  currentUserId,
  onSuccess,
  variant = "default",
  friendId,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSendRequest = async () => {
    if (!friendId || !friendId.trim()) {
      setError("Friend ID is required");
      return;
    }

    if (friendId === currentUserId) {
      setError("Cannot send request to yourself");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1️⃣ Send API request
      const response = await axios.post(
        `${BASE_URL}/api/friends/send/request`,
        { to: friendId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Friend request sent via API:", response.data);

      // 2️⃣ Emit socket event
      const socket = getSocket(token);
      socket?.emit("friend:request:send", {
        toUserId: friendId,
      });

      console.log("✅ Socket event emitted to user:", friendId);

      setSuccess("Friend request sent ✅");

      // 3️⃣ Call callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // 4️⃣ Reset after 2 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error sending request";
      setError(errorMsg);
      console.error("❌ Error:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // VARIANT 1: Button Only - Direct Action
  if (variant === "button-only") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
        >
          {loading ? "Sending..." : "➕ Add Friend"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
        {success && <span className="text-green-600 text-sm">{success}</span>}
      </div>
    );
  }

  // VARIANT 2: Inline Form - Direct Action
  if (variant === "inline") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Friend</h3>

        {error && (
          <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 bg-green-100 text-green-700 rounded text-sm">
            ✅ {success}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Friend ID: <span className="font-mono text-gray-900">{friendId}</span>
          </p>

          <button
            onClick={handleSendRequest}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
          >
            {loading ? "Sending Request..." : "Send Friend Request"}
          </button>
        </div>
      </div>
    );
  }

  // VARIANT 3: Card (Direct) - No expand needed
  if (variant === "card") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Friend</h3>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-3 bg-green-100 text-green-700 rounded text-sm">
            ✅ {success}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Sending request to: <span className="font-semibold">{friendId}</span>
          </p>

          <button
            onClick={handleSendRequest}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    );
  }

  // VARIANT 4: Floating Button - Direct Action
  if (variant === "floating") {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center text-3xl transition hover:scale-110"
          title="Add Friend"
        >
          {loading ? "..." : "➕"}
        </button>

        {(error || success) && (
          <div className="absolute bottom-20 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 text-green-700 rounded text-sm">
                {success}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // VARIANT 5: Compact - Direct Action
  if (variant === "compact") {
    return (
      <div className="flex gap-2 items-center">
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
        >
          {loading ? "..." : "Add"}
        </button>
        {error && <span className="text-red-600 text-xs">{error}</span>}
        {success && <span className="text-green-600 text-xs">{success}</span>}
      </div>
    );
  }

  // DEFAULT: Featured with Icon - Direct Action
  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">👥</div>
          <div>
            <h3 className="font-semibold text-gray-900">Add New Friend</h3>
            <p className="text-sm text-gray-600">One-click friend request</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-100 text-red-700 rounded text-sm border border-red-300">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 bg-green-100 text-green-700 rounded text-sm border border-green-300">
          ✅ {success}
        </div>
      )}

      <div className="space-y-3">
        <div className="bg-white rounded p-3">
          <p className="text-xs text-gray-600 mb-1">Friend User ID:</p>
          <p className="text-sm font-mono font-semibold text-gray-900">{friendId}</p>
        </div>

        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
        >
          {loading ? "Sending Request..." : "Send Friend Request"}
        </button>
      </div>
    </div>
  );
}
