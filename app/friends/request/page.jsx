"use client";

import { useEffect, useState } from "react";
import { getSocket } from "../../utils/socket";

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState([]);

  const BASE_URL = "https://chat-app-1-qvl9.onrender.com";
  const token = localStorage.getItem("authToken");

  const fetchRequests = async () => {
    const res = await axios.get(
      `${BASE_URL}/api/friends/requests`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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

    // socket notification
    getSocket().emit("friend:request:accept", {
      toUserId: fromUserId,
    });

    fetchRequests();
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

    fetchRequests();
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
