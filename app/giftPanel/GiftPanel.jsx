"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

export default function GiftPanel({
  roomId,
  socket,
  currentUser,
  selectedUser, // ✅ TARGET USER
  roomUsers = [], // [{id, username}]
  micUsers = [], // [userId]
  micStatus = {},
}) {
  const [gifts, setGifts] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [sendType, setSendType] = useState("individual");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  /* =========================
     FETCH GIFTS
  ========================= */
  useEffect(() => {
    axios
      .get("https://api.dilvoicechat.fun/api/gift/getAllGift")
      .then((res) => setGifts(res.data.gifts || []))
      .catch(() => {});
  }, []);

  /* =========================
     SEND GIFT
  ========================= */
  const sendGift = async () => {
    if (!selectedGift) return alert("Select a gift");

    // 🔥 VALIDATION
    if (sendType === "individual" && !selectedUser) {
      return alert("Select a user to send gift");
    }

    try {
      setLoading(true);

      const payload = {
        roomId,
        giftId: selectedGift._id,
        sendType,
      };

      // ✅ INDIVIDUAL
      if (sendType === "individual") {
        payload.recipients = [selectedUser.id];
      }

      // ✅ ALL IN ROOM
      if (sendType === "all_in_room") {
        payload.micOnlineUsers = roomUsers.map((u) => u.id);
      }

      // ✅ ALL ON MIC
      if (sendType === "all_on_mic") {
        payload.micOnlineUsers = micUsers; // must be [userId]
        payload.micStatus = micStatus;
      }

      await axios.post(
        "https://api.dilvoicechat.fun/api/gift/sendGift",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelectedGift(null);
    } catch (err) {
      alert(err.response?.data?.message || "Gift failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-3">
      {/* 🎁 GIFTS */}
      <div className="grid grid-cols-4 gap-3">
        {gifts.map((gift) => (
          <button
            key={gift._id}
            onClick={() => setSelectedGift(gift)}
            className={`p-2 rounded border ${
              selectedGift?._id === gift._id
                ? "border-yellow-400"
                : "border-gray-700"
            }`}
          >
            <Image
              src={gift.icon}
              alt={gift.name}
              width={50}
              height={50}
              unoptimized
            />
            <p className="text-xs text-center mt-1">{gift.price} 🪙</p>
          </button>
        ))}
      </div>

      {/* 🎯 SEND TYPE */}
      <div className="flex gap-2 mt-3">
        {["individual", "all_in_room", "all_on_mic"].map((type) => (
          <button
            key={type}
            onClick={() => setSendType(type)}
            className={`px-3 py-1 text-xs rounded ${
              sendType === type
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-white"
            }`}
          >
            {type.replaceAll("_", " ")}
          </button>
        ))}
      </div>

      {/* 🚀 SEND */}
      <button
        onClick={sendGift}
        disabled={loading}
        className="mt-3 w-full bg-pink-600 hover:bg-pink-700 py-2 rounded font-semibold"
      >
        {loading ? "Sending..." : "🎁 Send Gift"}
      </button>
    </div>
  );
}
