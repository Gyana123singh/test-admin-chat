"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [token, setToken] = useState(null);

  const BASE_URL = "http://localhost:5000";

  // ✅ Read token safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

  // ✅ Fetch friends only when token exists
  useEffect(() => {
    if (!token) return;

    axios
      .get(`${BASE_URL}/api/friends/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((res) => setFriends(res.data))
      .catch(() => alert("Failed to load friends"));
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Friends</h1>

      {friends.map((f) => {
        const friend = f.from || f.to;

        return (
          <div
            key={f._id}
            className="flex items-center gap-3 p-3 border rounded mb-3"
          >
            <img
              src={friend.avatar}
              className="w-10 h-10 rounded-full"
              alt=""
            />
            <span>{friend.username}</span>
          </div>
        );
      })}
    </div>
  );
}
