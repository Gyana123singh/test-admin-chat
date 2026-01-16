"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash } from "lucide-react";

import AddGiftModal from "../giftStoreManagement/AddStoreGiftModal";
import EditGiftModal from "../giftsManagement/EditGiftModal";

const API_BASE = "https://chat-app-1-qvl9.onrender.com/api/store-gifts";

const CATEGORY_TYPES = [
  "ALL",
  "ENTRANCE",
  "FRAME",
  "RING",
  "BUBBLE",
  "THEME",
  "EMOJI",
];

export default function GiftsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedGift, setSelectedGift] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedType, setSelectedType] = useState("ALL");
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [total, setTotal] = useState(0);

  /* ===============================
     FETCH GIFTS BY TYPE
  =============================== */
  const fetchGifts = async (categoryType = "ALL", skipValue = 0) => {
    try {
      setLoading(true);

      const url =
        categoryType === "ALL"
          ? `${API_BASE}/getStoreCategory`
          : `${API_BASE}/get-gift-by-category/${categoryType}`;

      const res = await axios.get(url, {
        params: { skip: skipValue, limit },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        setGifts((prev) =>
          skipValue === 0 ? res.data.data : [...prev, ...res.data.data]
        );
        setTotal(res.data.pagination?.total || 0);
      } else {
        setGifts([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("❌ Fetch gifts failed:", error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    fetchGifts("ALL", 0);
  }, []);

  /* ===============================
     TYPE CHANGE
  =============================== */
  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSkip(0);
    fetchGifts(type, 0);
  };

  /* ===============================
     LOAD MORE
  =============================== */
  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchGifts(selectedType, newSkip);
  };

  /* ===============================
     DELETE GIFT
  =============================== */
  const handleDelete = async (giftId) => {
    if (!confirm("Are you sure you want to delete this gift?")) return;

    try {
      await axios.delete(`${API_BASE}/delete/${giftId}`);
      setGifts((prev) => prev.filter((g) => g._id !== giftId));
      alert("Gift deleted successfully ✅");
    } catch (error) {
      console.error("❌ Delete gift failed:", error);
      alert(error?.response?.data?.message || "Failed to delete gift");
    }
  };

  return (
    <div className="p-6 overflow-y-auto h-screen bg-[#f8f9fc]">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🎁 Gifts Management</h1>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenAdd(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus size={18} /> Add Gift Store
          </button>
        </div>
      </div>

      {/* CATEGORY TYPE FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {CATEGORY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition ${
              selectedType === type
                ? "bg-purple-600 text-white"
                : "bg-white border hover:bg-purple-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading gifts...</p>}

      {/* GIFTS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {!loading && gifts.length === 0 && (
          <p className="text-gray-500">No gifts found.</p>
        )}

        {gifts.map((gift) => (
          <div
            key={gift._id}
            className="bg-white rounded-xl shadow p-3 border hover:shadow-lg transition"
          >
            <img
              src={gift.giftImage || "/placeholder.png"}
              alt={gift.name}
              className="w-full h-28 object-contain rounded mb-2"
            />

            <h3 className="text-sm font-semibold truncate">{gift.name}</h3>

            <p className="text-xs text-gray-600">
              {gift.category?.type || "Uncategorized"}
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

      {/* LOAD MORE */}
      {gifts.length < total && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Load More
          </button>
        </div>
      )}

      {/* MODALS */}
      {openAdd && (
        <AddGiftModal
          close={() => setOpenAdd(false)}
          onSuccess={() => fetchGifts(selectedType, 0)}
        />
      )}

      {openEdit && selectedGift && (
        <EditGiftModal
          gift={selectedGift}
          close={() => setOpenEdit(false)}
          onSuccess={() => fetchGifts(selectedType, 0)}
        />
      )}
    </div>
  );
}
