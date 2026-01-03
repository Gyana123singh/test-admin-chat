"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "../../utils/socket";
import useFriendSocket from "../../utils/friendsRequestSoket";

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState([]);
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
      console.log("🔔 New request received:", data);
      if (token) {
        fetchRequests(token);
      }
    },
    onRequestAccepted: (data) => {
      console.log("🎉 Request accepted:", data);
    },
    onError: (error) => {
      console.error("Socket error:", error);
    },
  });

  const fetchRequests = async (authToken) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/friends/requests`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        withCredentials: true,
      });
      setRequests(res.data);
      setError(null);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to fetch requests";
      setError(errorMsg);
      console.error("❌ Error fetching requests:", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests(token);
    }
  }, [token]);

  const acceptRequest = async (requestId, fromUserId) => {
    try {
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

      console.log("✅ Request accepted via API");

      const socket = getSocket(token);
      socket?.emit("friend:request:accept", {
        toUserId: fromUserId,
      });

      console.log("✅ Socket event emitted to user:", fromUserId);

      fetchRequests(token);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error accepting request";
      setError(errorMsg);
      console.error("❌ Error:", errorMsg);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
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

      console.log("✅ Request rejected");
      fetchRequests(token);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error rejecting request";
      setError(errorMsg);
      console.error("❌ Error:", errorMsg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Friend Requests</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading requests...
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No pending friend requests
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={req.from.avatar || "/default-avatar.png"}
                  alt={req.from.username}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
                <div>
                  <p className="font-semibold">{req.from.username}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => acceptRequest(req._id, req.from._id)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded font-medium hover:bg-green-700 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectRequest(req._id)}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded font-medium hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
