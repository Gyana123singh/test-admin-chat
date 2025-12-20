"use client";
import { useState } from "react";
import { HiArrowLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";

const router = useRouter();
export default function CreateRoomPage() {
  const [activeTab, setActiveTab] = useState("Game-Carrom");

  const tabs = ["Game-Carrom", "Game-Ludo", "Chat"];

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white px-4">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-4">
        <HiArrowLeft className="text-xl cursor-pointer" />
      </div>

      {/* TITLE */}
      <h1 className="text-xl font-semibold mb-4">❤️ Nicholas ❤️</h1>

      <hr className="mb-5" />

      {/* TABS */}
      <div className="flex gap-3 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                activeTab === tab
                  ? "bg-teal-400 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* WELCOME INPUT */}
      <input
        type="text"
        placeholder="Welcome"
        className="w-28 px-3 py-2 bg-gray-100 rounded-lg text-sm outline-none"
      />

      {/* CREATE BUTTON */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[420px] px-4">
        <button
          className="w-full bg-teal-400 text-white py-3 rounded-full text-lg font-medium"
          onClick={() => router.push("/room")}
        >
          Create
        </button>
      </div>
    </div>
  );
}
