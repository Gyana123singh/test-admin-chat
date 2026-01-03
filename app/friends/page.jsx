"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import useFriendSocket from "../utils/friendsRequestSoket";

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("authToken");
      const storedUserId = localStorage.getItem("userId");
      const storedUserData = localStorage.getItem("userData");

      setToken(authToken);
      setUserId(storedUserId);

      if (storedUserData) {
        try {
          setUserData(JSON.parse(storedUserData));
        } catch (e) {
          console.error("Failed to parse userData:", e);
        }
      }
    }
  }, []);

  useFriendSocket(userId, userData?.username, userData?.avatar, {
    onRequestReceived: (data) => {
      console.log("🔔 Friend request received from:", data.fromUsername);
    },
    onRequestAccepted: (data) => {
      console.log("🎉 Friend added:", data.fromUsername);
      if (token) {
        fetchFriends(token);
      }
    },
    onError: (error) => {
      console.error("Socket error:", error);
    },
  });

  const fetchFriends = async (authToken) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/friends/list`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });

      const friendsList = res.data.map((friendship) => {
        const friend = friendship.from._id === userId ? friendship.to : friendship.from;
        return {
          ...friendship,
          friendData: friend,
        };
      });

      setFriends(friendsList);
      setError(null);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to load friends";
      setError(errorMsg);
      console.error("❌ Error loading friends:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFriends(token);
    }
  }, [token]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Friends</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading friends...
        </div>
      )}

      {!loading && friends.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No friends yet. Start adding friends! 👋</p>
        </div>
      )}

      {!loading && friends.length > 0 && (
        <div className="space-y-3">
          {friends.map((friendship) => {
            const friend = friendship.friendData;

            if (!friend) return null;

            return (
              <div
                key={friendship._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatar || "/default-avatar.png"}
                    alt={friend.username}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                  <div>
                    <p className="font-semibold">{friend.username}</p>
                    <p className="text-xs text-gray-500">
                      Friends since{" "}
                      {new Date(friendship.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700 transition">
                    Message
                  </button>
                  <button className="px-4 py-2 bg-gray-400 text-white text-sm rounded font-medium hover:bg-gray-500 transition">
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
