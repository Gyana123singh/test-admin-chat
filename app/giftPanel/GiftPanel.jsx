"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";

const CATEGORIES = ["HOT", "LUCKY", "SIV", "CUSTOMIZED", "BAG"];

export default function GiftPanel({ roomId, socket }) {
  const [gifts, setGifts] = useState([]);
  const [sendType, setSendType] = useState("all_in_room");
  const [category, setCategory] = useState("HOT");

  const [selectedGift, setSelectedGift] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const comboTimer = useRef(null);

  /* ================= FETCH GIFTS ================= */
  useEffect(() => {
    axios
      .get(
        `https://api.dilvoicechat.fun/api/gift/get-gift-by-category/${category}`,
      )
      .then((res) => setGifts(res.data.data || []));
  }, [category]);

  /* ================= SELECT GIFT ================= */
  const selectGift = (gift) => {
    if (selectedGift?._id === gift._id) {
      setComboCount((c) => c + 1);
    } else {
      setSelectedGift(gift);
      setComboCount(1);
    }

    clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => {
      setComboCount(0);
      setSelectedGift(null);
    }, 2000);
  };

  /* ================= SEND GIFT ================= */
  const sendGift = () => {
    if (!socket || !roomId || !selectedGift) return;

    socket.emit("gift:send", {
      roomId,
      giftId: selectedGift._id,
      sendType,
      quantity: comboCount || 1, // ✅ send quantity
    });

    // keep combo running if user sends again quickly
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 bg-[#111] z-50">
      {/* CATEGORY */}
      <div className="flex gap-2 p-2 overflow-x-auto text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded ${
              category === cat ? "bg-yellow-500 text-black" : "bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SEND TYPE */}
      <div className="flex justify-around p-2 text-xs">
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

      {/* GIFTS GRID */}
      <div className="grid grid-cols-4 gap-3 p-3">
        {gifts.map((gift) => (
          <button
            key={gift._id}
            onClick={() => selectGift(gift)}
            className={`p-2 rounded ${
              selectedGift?._id === gift._id
                ? "bg-yellow-600 text-black"
                : "bg-gray-800"
            }`}
          >
            <img src={gift.icon} className="w-12 mx-auto" />
            <p className="text-xs">{gift.name}</p>
            <p className="text-xs text-yellow-400">💰 {gift.price}</p>

            {selectedGift?._id === gift._id && comboCount > 1 && (
              <span className="text-xs font-bold">x{comboCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ✅ SEND BUTTON */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={sendGift}
          disabled={!selectedGift}
          className={`w-full py-2 rounded font-semibold ${
            selectedGift
              ? "bg-yellow-500 text-black"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {selectedGift ? `Send ${selectedGift.name}` : "Select a gift to send"}
        </button>
      </div>
    </div>
  );
}
