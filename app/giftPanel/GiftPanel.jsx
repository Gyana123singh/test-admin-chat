"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function GiftPanel({ roomId, socket }) {
  const [gifts, setGifts] = useState([]);
  const [sendType, setSendType] = useState("all_in_room");
  const [category, setCategory] = useState("room"); // default category

  /* =========================
     FETCH GIFTS BY CATEGORY
  ========================= */
  useEffect(() => {
    axios
      .get(
        `https://api.dilvoicechat.fun/api/gift/get-gift-by-category/${category}`
      )
      .then((res) => {
        setGifts(res.data.data || []);
      })
      .catch((err) => {
        console.error("❌ Gift fetch error:", err);
      });
  }, [category]);

  /* =========================
     SEND GIFT
  ========================= */
  const sendGift = (giftId) => {
    if (!socket || !roomId) return;

    socket.emit("gift:send", {
      roomId,
      giftId,
      sendType,
    });
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-[#111] border-t border-gray-700 z-50">
      
      {/* CATEGORY TABS */}
      <div className="flex gap-2 px-3 py-2 border-b border-gray-700 overflow-x-auto text-xs">
        {["room", "love", "vip", "pk"].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              category === cat
                ? "bg-yellow-500 text-black"
                : "bg-gray-700 text-white"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* SEND TYPE */}
      <div className="flex justify-around p-2 border-b border-gray-700 text-xs">
        <button
          onClick={() => setSendType("all_in_room")}
          className={`px-3 py-1 rounded ${
            sendType === "all_in_room"
              ? "bg-blue-600"
              : "bg-gray-700"
          }`}
        >
          All Room
        </button>

        <button
          onClick={() => setSendType("all_on_mic")}
          className={`px-3 py-1 rounded ${
            sendType === "all_on_mic"
              ? "bg-green-600"
              : "bg-gray-700"
          }`}
        >
          On Mic
        </button>
      </div>

      {/* GIFTS GRID */}
      <div className="grid grid-cols-4 gap-3 p-3">
        {gifts.map((gift) => (
          <button
            key={gift._id}
            onClick={() => sendGift(gift._id)}
            className="flex flex-col items-center bg-gray-800 rounded p-2 hover:bg-gray-700"
          >
            <img src={gift.icon} className="w-12 h-12" />
            <p className="text-xs mt-1">{gift.name}</p>
            <p className="text-xs text-yellow-400">💰 {gift.price}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
