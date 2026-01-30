"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function GiftPanel({ roomId, socket, currentUser, roomUsers }) {
  const [categories, setCategories] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sendType, setSendType] = useState("all_in_room");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  /* ================= FETCH CATEGORY ================= */
  useEffect(() => {
    axios
      .get("https://api.dilvoicechat.fun/api/gifts/categories")
      .then((res) => {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0) {
          setActiveCategory(res.data.categories[0]._id);
        }
      });
  }, []);

  /* ================= FETCH GIFTS ================= */
  useEffect(() => {
    if (!activeCategory) return;

    axios
      .get("https://api.dilvoicechat.fun/api/gift/getAllGift")
      .then((res) => {
        setGifts(res.data.gifts);
      });
  }, [activeCategory]);

  /* ================= SEND GIFT ================= */
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
      {/* CATEGORY */}
      <div className="flex overflow-x-auto p-2 gap-3 border-b border-gray-700">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
              activeCategory === cat._id
                ? "bg-yellow-500 text-black"
                : "bg-gray-800 text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* GIFTS */}
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

      {/* SEND TYPE */}
      <div className="flex justify-around p-2 border-t border-gray-700 text-xs">
        <button
          onClick={() => setSendType("all_in_room")}
          className={`px-3 py-1 rounded ${
            sendType === "all_in_room" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          All Room
        </button>

        <button
          onClick={() => setSendType("all_on_mic")}
          className={`px-3 py-1 rounded ${
            sendType === "all_on_mic" ? "bg-green-600" : "bg-gray-700"
          }`}
        >
          On Mic
        </button>
      </div>
    </div>
  );
}
