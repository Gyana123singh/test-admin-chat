"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import FriendRequestCard from "@/components/FriendRequestCard";
import useFriendSocket from "@/hooks/useFriendSocket";

export default function FriendRequestsPage() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authToken = localStorage.getItem("authToken");
      const storedUserId = localStorage.getItem("userId");
      const storedUserData = localStorage.getItem("userData");

      if (!authToken) {
        router.push("/login");
        return;
      }

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
  }, [router]);

  useFriendSocket(userId, userData?.username, userData?.avatar, {
    onRequestReceived: () => {
      console.log("🔔 New request received - refreshing list");
      fetchRequests();
    },
  });

  const fetchRequests = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${BASE_URL}/api/friends/get/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setRequests(response.data);
      console.log("✅ Friend requests loaded:", response.data.length);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  const handleAccept = (requestId) => {
    setRequests(requests.filter((req) => req._id !== requestId));
  };

  const handleReject = (requestId) => {
    setRequests(requests.filter((req) => req._id !== requestId));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Friend Requests</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center bg-white rounded-lg p-8 shadow">
            <p className="text-gray-600 text-lg">No pending friend requests</p>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <FriendRequestCard
                key={request._id}
                request={request}
                token={token}
                currentUserId={userId}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
