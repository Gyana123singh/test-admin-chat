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

  /* ===============================
     FETCH ALL GIFTS
  =============================== */
  useEffect(() => {
    const fetchGifts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/category/getAllGift"
        );

        console.log("data", res.data);
        setGifts(res.data.gifts || []);
      } catch (error) {
        console.error("Fetch gifts failed:", error);
        setGifts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, []);

  /* ===============================
     DELETE (UI ONLY FOR NOW)
  =============================== */
  const handleDelete = (id) => {
    if (!confirm("Are you sure to delete this gift?")) return;

    // TODO: connect backend delete API later
    setGifts((prev) => prev.filter((g) => g._id !== id));
  };

  return (
    <div className="p-6 overflow-y-auto h-screen bg-[#f8f9fc]">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🎁 Gifts Management</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenAddCategory(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus size={18} /> Add Category
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus size={18} /> Add Gift
          </button>
        </div>
      </div>

      {/* GRID */}
      {loading && <p className="text-gray-500">Loading gifts...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {!loading && gifts.length === 0 && (
          <p className="text-gray-500">No gifts added yet.</p>
        )}

        {gifts.map((gift) => (
          <div
            key={gift._id}
            className="bg-white rounded-xl shadow p-3 border hover:shadow-lg transition"
          >
            <img
              src={gift.giftImage}
              alt={gift.name}
              className="w-full h-28 object-contain rounded mb-2"
            />

            <h3 className="text-sm font-semibold">{gift.name}</h3>

            <p className="text-xs text-gray-600">
              {gift.addCategory || "No Category"}
            </p>

            <p className="text-xs font-semibold text-purple-600">
              {gift.price} coins
            </p>

            <div className="flex justify-between mt-2">
              <button
                onClick={() => {
                  setSelectedGift(gift);
                  setOpenEdit(true);
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit size={18} />
              </button>

              <button
                onClick={() => handleDelete(gift._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {openAdd && (
        <AddGiftModal
          close={() => setOpenAdd(false)}
          addGift={(gift) => setGifts((prev) => [gift, ...prev])}
        />
      )}

      {openAddCategory && (
        <AddCategoryModal close={() => setOpenAddCategory(false)} />
      )}

      {openEdit && selectedGift && (
        <EditGiftModal
          close={() => setOpenEdit(false)}
          gift={selectedGift}
          updateGift={(updated) =>
            setGifts((prev) =>
              prev.map((g) => (g._id === updated._id ? updated : g))
            )
          }
        />
      )}
    </div>
  );
}
