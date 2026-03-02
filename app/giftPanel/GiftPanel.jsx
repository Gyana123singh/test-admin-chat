"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const CATEGORIES = ["HOT", "LUCKY", "SIV", "CUSTOMIZED", "BAG"];

export default function GiftPanel({
  roomId,
  socket,
  onClose,
  pkId = null,
  pkTargetUserId = null,
  pkMode = null,
  participants = [], // 👈 NEW
}) {
  const [gifts, setGifts] = useState([]);
  const [sendType, setSendType] = useState("all_in_room"); // all_in_room | individual | all_on_mic
  const [category, setCategory] = useState("HOT");
  const [selectedGift, setSelectedGift] = useState(null);
  const [comboCount, setComboCount] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(""); // 👈 for individual

  useEffect(() => {
    axios
      .get(
        `https://api.dilvoicechat.fun/api/gift/get-gift-by-category/${category}`,
      )
      .then((res) => setGifts(res.data.data || []));
  }, [category]);

  const sendGift = () => {
    if (!socket || !roomId || !selectedGift) return;

    // 🎯 PK gift (unchanged)
    if (pkId && pkTargetUserId && pkMode && pkMode !== "votes") {
      socket.emit("gift:send", {
        roomId,
        giftId: selectedGift._id,
        sendType: "pk",
        toUserId: pkTargetUserId,
        pkId,
        comboCount: 1, // PK always x1
      });
    } else {
      // 🎁 Normal gift
      const payload = {
        roomId,
        giftId: selectedGift._id,
        sendType, // all_in_room / individual / all_on_mic
        comboCount, // 1 / 9 / 49 / 99
      };

      if (sendType === "individual") {
        if (!selectedUserId) {
          alert("Please select a user");
          return;
        }
        payload.toUserId = selectedUserId;
      }

      socket.emit("gift:send", payload);
    }

    setSelectedGift(null);
    setComboCount(1);
    setSelectedUserId("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111] z-50">
      <div className="flex justify-between p-2">
        <p>🎁 Send Gift</p>
        <button onClick={onClose}>❌</button>
      </div>

      {/* 🔽 SEND TYPE SELECTOR */}
      {!pkId && (
        <div className="flex gap-2 p-2 text-xs">
          {[
            { key: "all_in_room", label: "All in Room" },
            { key: "individual", label: "Individual" },
            { key: "all_on_mic", label: "All on Mic" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSendType(t.key)}
              className={`px-3 py-1 rounded ${
                sendType === t.key
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* 👤 USER SELECT (ONLY FOR INDIVIDUAL) */}
      {sendType === "individual" && !pkId && (
        <div className="p-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded text-sm"
          >
            <option value="">Select user</option>
            {participants.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username || "User"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Categories */}
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

      {/* Combos (only for normal gifts) */}
      {!pkId && (
        <div className="flex justify-around p-2">
          {[1, 9, 49, 99].map((n) => (
            <button
              key={n}
              onClick={() => setComboCount(n)}
              className={`px-3 py-1 rounded ${
                comboCount === n ? "bg-yellow-500 text-black" : "bg-gray-700"
              }`}
            >
              x{n}
            </button>
          ))}
        </div>
      )}

      {/* Gift Grid */}
      <div className="grid grid-cols-4 gap-3 p-3">
        {gifts.map((gift) => (
          <button
            key={gift._id}
            onClick={() => setSelectedGift(gift)}
            className={`p-2 rounded ${
              selectedGift?._id === gift._id
                ? "bg-yellow-600 text-black"
                : "bg-gray-800"
            }`}
          >
            <img src={gift.icon} className="w-12 mx-auto" />
            <p className="text-xs">{gift.name}</p>
            <p className="text-xs text-yellow-400">💰 {gift.price}</p>
          </button>
        ))}
      </div>

      {/* Send Button */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={sendGift}
          disabled={!selectedGift}
          className="w-full py-2 rounded font-semibold bg-yellow-500 text-black"
        >
          Send Gift
        </button>
      </div>
    </div>
  );
}
