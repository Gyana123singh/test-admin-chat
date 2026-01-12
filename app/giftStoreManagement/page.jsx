"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash } from "lucide-react";

import AddGiftModal from "../giftStoreManagement/AddStoreGiftModal";
import EditGiftModal from "../giftsManagement/EditGiftModal";
import AddCategoryModal from "../giftStoreManagement/AddStoreCategoryModal";

const API_BASE = "https://chat-app-1-qvl9.onrender.com/api/store-gifts";

export default function GiftsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedGift, setSelectedGift] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categoryId, setCategoryId] = useState("all");
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [total, setTotal] = useState(0);

  /* ===============================
     FETCH GIFTS (BACKEND MATCH)
  =============================== */
  const fetchGifts = async (selectedCategory = "all", skipValue = 0) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/get-gift-by-category/${selectedCategory}`,
        {
          params: { skip: skipValue, limit },
        }
      );

      if (res.data?.success && Array.isArray(res.data.data)) {
        setGifts(res.data.data);
        setTotal(res.data.pagination.total);
      } else {
        setGifts([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Fetch gifts failed:", error);
      setGifts([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    fetchGifts("all", 0);
  }, []);

  /* ===============================
     CATEGORY CHANGE
  =============================== */
  const handleCategoryChange = (id) => {
    setCategoryId(id);
    setSkip(0);
    fetchGifts(id, 0);
  };

  /* ===============================
     LOAD MORE
  =============================== */
  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchGifts(categoryId, newSkip);
  };

  /* ===============================
     DELETE GIFT (NO AUTH)
  =============================== */
  const handleDelete = async (giftId) => {
    if (!confirm("Are you sure you want to delete this gift?")) return;

    try {
      await axios.delete(`${API_BASE}/delete/${giftId}`);

      // ✅ Update UI
      setGifts((prev) => prev.filter((g) => g._id !== giftId));

      alert("Gift deleted successfully ✅");
    } catch (error) {
      console.error("Delete gift failed:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to delete gift. Please try again."
      );
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
            <Plus size={18} /> Add Gift Store Category
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Gift Store
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`px-4 py-1 rounded ${
            categoryId === "all"
              ? "bg-purple-600 text-white"
              : "bg-white border"
          }`}
        >
          All
        </button>
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
              src={gift.giftImage || "/placeholder.png"}
              alt={gift.name}
              className="w-full h-28 object-contain rounded mb-2"
            />

            <h3 className="text-sm font-semibold truncate">{gift.name}</h3>

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

      {/* LOAD MORE */}
      {gifts.length < total && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Load More
          </button>
        </div>
      )}

      {/* MODALS */}
      {openAdd && (
        <AddGiftModal close={() => setOpenAdd(false)} onSuccess={fetchGifts} />
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
