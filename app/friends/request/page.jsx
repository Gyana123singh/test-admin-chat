"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "../../utils/socket";

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [token, setToken] = useState(null);

  const BASE_URL = "https://chat-app-1-qvl9.onrender.com";

  // ✅ Read token safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

  const fetchRequests = async (authToken) => {
    const res = await axios.get(`${BASE_URL}/api/friends/requests`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      withCredentials: true,
    });
    setRequests(res.data);
  };

  useEffect(() => {
    if (token) fetchRequests(token);
  }, [token]);

  const acceptRequest = async (requestId, fromUserId) => {
    await axios.post(
      `${BASE_URL}/api/friends/accept`,
      { requestId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    const socket = getSocket(token);
    socket?.emit("friend:request:accept", {
      toUserId: fromUserId,
    });

    fetchRequests(token);
  };

  const rejectRequest = async (requestId) => {
    await axios.post(
      `${BASE_URL}/api/friends/reject`,
      { requestId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    fetchRequests(token);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Friend Requests</h1>

      {requests.map((req) => (
        <div
          key={req._id}
          className="flex items-center justify-between p-3 border rounded mb-3"
        >
          <div className="flex items-center gap-3">
            <img
              src={req.from.avatar}
              className="w-10 h-10 rounded-full"
              alt=""
            />
            <span>{req.from.username}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => acceptRequest(req._id, req.from._id)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => rejectRequest(req._id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
