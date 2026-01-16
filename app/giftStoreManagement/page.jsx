"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash } from "lucide-react";

import AddStoreCategoryModal from "../giftStoreManagement/AddStoreCategory.jsx";
import AddStoreGiftModal from "../giftStoreManagement/AddStoreGiftModal.jsx";

const API_BASE = "https://chat-app-1-qvl9.onrender.com/api/store-gifts";

export default function GiftsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedGift, setSelectedGift] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(false);

  /* ===============================
     FETCH CATEGORIES (FROM API)
  =============================== */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/getStoreCategory`);

      if (res.data?.success && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories.map((c) => c.type));
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("❌ Fetch categories failed:", error);
      setCategories([]);
    }
  };

  /* ===============================
     FETCH GIFTS (FILTERABLE)
  =============================== */
  const fetchGifts = async (category = "ALL") => {
    try {
      setLoading(true);

      const url =
        category === "ALL"
          ? `${API_BASE}`
          : `${API_BASE}/get-gift-by-category/${category}`;

      const res = await axios.get(url);

      if (res.data?.success && Array.isArray(res.data.data)) {
        setGifts(res.data.data);
      } else {
        setGifts([]);
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
    fetchCategories();
    fetchGifts("ALL");
  }, []);

  /* ===============================
     CATEGORY CHANGE
  =============================== */
  const handleTypeChange = (type) => {
    setSelectedType(type);
    fetchGifts(type);
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
            onClick={() => setOpenAddCategory(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Gift Category
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Gift
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => handleTypeChange("ALL")}
          className={`px-4 py-1 rounded-full text-sm font-semibold transition ${
            selectedType === "ALL"
              ? "bg-purple-600 text-white"
              : "bg-white border hover:bg-purple-50"
          }`}
        >
          ALL
        </button>

        {categories.map((type) => (
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
          <div key={gift._id} className="bg-white rounded-xl shadow p-3 border">
            <img
              src={
                gift.icon
                  ? `https://chat-app-1-qvl9.onrender.com/${gift.icon}`
                  : "/placeholder.png"
              }
              alt={gift.name}
              className="w-full h-28 object-contain rounded mb-2"
            />

            <h3 className="text-sm font-semibold truncate">{gift.name}</h3>

            <p className="text-xs text-gray-600">
              {gift.category || "Uncategorized"}
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

      {/* MODALS */}
      {openAdd && (
        <AddStoreGiftModal close={() => setOpenAdd(false)} onSuccess={fetchGifts} />
      )}

      {openAddCategory && (
        <AddStoreCategoryModal close={() => setOpenAddCategory(false)} />
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
