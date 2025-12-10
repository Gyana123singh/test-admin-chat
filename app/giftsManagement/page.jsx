"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import AddGiftModal from "../giftsManagement/AddGiftModal";
import EditGiftModal from "../giftsManagement/EditGiftModal";

export default function GiftsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);

  // Temporary UI data storage
  const [gifts, setGifts] = useState([]);

  const handleDelete = (id) => {
    if (confirm("Are you sure to delete this gift?")) {
      setGifts(gifts.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-screen bg-[#f8f9fc]">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🎁 Gifts Management</h1>
        <button
          onClick={() => setOpenAdd(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus size={18} /> Add Gift
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {gifts.length === 0 && (
          <p className="text-gray-500">No gifts added yet.</p>
        )}

        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="bg-white rounded-xl shadow p-3 border hover:shadow-lg transition"
          >
            <img
              src={gift.image}
              className="w-full h-28 object-contain rounded mb-2"
            />

            <h3 className="text-sm font-semibold">{gift.name}</h3>

            <p className="text-xs text-gray-600">{gift.category}</p>
            <p className="text-xs font-semibold text-purple-600">
              {gift.coinCost} coins
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
                onClick={() => handleDelete(gift.id)}
                className="text-red-500 hover:text-red-700"
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
          addGift={(gift) => setGifts([...gifts, gift])}
        />
      )}

      {openEdit && selectedGift && (
        <EditGiftModal
          close={() => setOpenEdit(false)}
          gift={selectedGift}
          updateGift={(updated) =>
            setGifts(gifts.map((g) => (g.id === updated.id ? updated : g)))
          }
        />
      )}
    </div>
  );
}
