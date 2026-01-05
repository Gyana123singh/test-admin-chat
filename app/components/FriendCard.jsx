"use client";

import { useState } from "react";

export default function FriendCard({ friend, token }) {
  const [loading, setLoading] = useState(false);

  const friendData =
    friend.from._id === JSON.parse(localStorage.getItem("userData") || "{}").id
      ? friend.to
      : friend.from;

  const handleMessage = () => {
    console.log("Messaging:", friendData.username);
  };

  const handleRemove = async () => {
    if (!confirm("Remove this friend?")) return;

    setLoading(true);
    try {
      console.log("Removing friend:", friendData._id);
    } catch (err) {
      console.error("Error removing friend:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={friendData.avatar || "/default-avatar.png"}
          alt={friendData.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">{friendData.username}</p>
          <p className="text-xs text-gray-500">
            👥 Friends since {new Date(friend.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          💬 Message
        </button>
        <button
          onClick={handleRemove}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition"
        >
          {loading ? "..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
