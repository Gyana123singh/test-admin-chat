"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash } from "lucide-react";

import AddGiftModal from "../giftsManagement/AddGiftModal";
import EditGiftModal from "../giftsManagement/EditGiftModal";
import AddCategoryModal from "../giftsManagement/AddCategoryModal";

export default function GiftsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedGift, setSelectedGift] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://chat-app-1-qvl9.onrender.com/api/gift/getAllGift"
      );

      if (res.data.success) {
        setGifts(res.data.gifts);
      } else {
        setGifts([]);
      }
    } catch (error) {
      console.error("Fetch gifts failed:", error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this gift?")) return;
    setGifts((prev) => prev.filter((g) => g._id !== id));
  };

  return (
    <div className="p-6 overflow-y-auto h-screen bg-[#f8f9fc]">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🎁 Gifts Management</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenAddCategory(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Category
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Gift
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading gifts...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {!loading && gifts.length === 0 && (
          <p className="text-gray-500">No gifts added yet.</p>
        )}

        {gifts.map((gift) => (
          <div
            key={gift._id}
            className="bg-white rounded-xl shadow p-3 border"
          >
            <img
              src={gift.giftImage}
              alt={gift.name}
              className="w-full h-28 object-contain rounded mb-2"
            />

            <h3 className="text-sm font-semibold truncate">
              {gift.name}
            </h3>

            {/* ✅ FIXED CATEGORY */}
            <p className="text-xs text-gray-600">
              {gift.category?.name || "Uncategorized"}
            </p>

            <p className="text-xs font-semibold text-purple-600">
              {gift.price} coins
            </p>

            <div className="flex justify-between mt-3">
              <button
                onClick={() => {
                  setSelectedGift(gift);
                  setOpenEdit(true);
                }}
                className="text-blue-500"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => handleDelete(gift._id)}
                className="text-red-500"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {openAdd && (
        <AddGiftModal
          close={() => setOpenAdd(false)}
          onSuccess={fetchGifts}
        />
      )}

      {openAddCategory && (
        <AddCategoryModal close={() => setOpenAddCategory(false)} />
      )}

      {openEdit && selectedGift && (
        <EditGiftModal
          gift={selectedGift}
          close={() => setOpenEdit(false)}
          onSuccess={fetchGifts}
        />
      )}
    </div>
  );
}
