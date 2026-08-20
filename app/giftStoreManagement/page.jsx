"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";

import AddStoreCategoryModal from "../giftStoreManagement/AddStoreCategory.jsx";
import AddStoreGiftModal from "../giftStoreManagement/AddStoreGiftModal.jsx";
import EditStoreGiftModal from "../giftStoreManagement/EditStoreGiftModal.jsx";

const API_BASE = "https://api.dilvoicechat.fun/api/store-gifts";

export default function GiftsPage() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [editingGift, setEditingGift] = useState(null);

  const [gifts, setGifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const [previewVideo, setPreviewVideo] = useState(null);

  // 10 ITEMS PER PAGE PAGINATION
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(gifts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGifts = gifts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  /* ===============================
     FETCH CATEGORIES
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
     FETCH GIFTS
  =============================== */
  const fetchGifts = async (category = "ALL") => {
    try {
      setLoading(true);

      const url =
        category === "ALL"
          ? `${API_BASE}/get-all-gifts`
          : `${API_BASE}/get-gift-by-category/${encodeURIComponent(category)}`;

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

  useEffect(() => {
    fetchCategories();
    fetchGifts("ALL");
  }, []);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
    fetchGifts(type);
  };

  const handleDelete = async (giftId) => {
    if (!confirm("Are you sure you want to delete this gift?")) return;

    try {
      await axios.delete(`${API_BASE}/delete/${giftId}`);
      setGifts((prev) => prev.filter((g) => g._id !== giftId));
      alert("Gift deleted successfully ✅");
    } catch (error) {
      console.error("❌ Delete gift failed:", error);
      alert("Failed to delete gift");
    }
  };

  // ✅ Detect video
  const isVideo = (url) => {
    return url?.toLowerCase().endsWith(".mp4");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-[#f8f9fc]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🎁 Store Gifts Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage avatars, frames, rides and store gifts</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <button
            onClick={() => setOpenAddCategory(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} /> Add Store Category
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} /> Add Store Gift
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex gap-2.5 mb-6 flex-wrap">
        <button
          onClick={() => handleTypeChange("ALL")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            selectedType === "ALL"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          ALL ({gifts.length})
        </button>

        {categories.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedType === type
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-sm font-medium py-8">Loading gifts...</p>}

      {/* GIFTS GRID */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {gifts.length === 0 && (
            <p className="text-gray-400 text-sm col-span-full py-8 text-center">No store gifts found.</p>
          )}

          {paginatedGifts.map((gift) => (
            <div key={gift._id} className="bg-white rounded-2xl border border-gray-200 shadow-xs p-3.5 flex flex-col justify-between hover:shadow-md transition">
              {/* Media Logic */}
              {isVideo(gift.icon) ? (
                <video
                  src={gift.icon}
                  muted
                  loop
                  className="w-full h-24 object-contain mb-2 rounded-lg bg-purple-50/40 p-1 cursor-pointer"
                  onClick={() => setPreviewVideo(gift.icon)}
                />
              ) : (
                <img
                  src={gift.icon || "/placeholder.png"}
                  alt={gift.name}
                  className="w-full h-24 object-contain mb-2 rounded-lg bg-purple-50/40 p-1 cursor-pointer"
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                />
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-900 truncate">{gift.name}</h3>
                <p className="text-xs text-gray-500 capitalize">{gift.category}</p>
                {gift.category?.toUpperCase() !== "RING" && gift.effectType?.toUpperCase() !== "RING" && (
                  <p className="text-xs font-semibold text-gray-400 mt-0.5">
                    {gift.validityDays || gift.days || 7} Days
                  </p>
                )}
                <p className="text-xs font-extrabold text-purple-700 mt-1">
                  {gift.price} coins
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingGift(gift)}
                  title="Edit Store Gift"
                  className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition cursor-pointer"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(gift._id)}
                  title="Delete Store Gift"
                  className="p-1 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 10 ITEMS PAGINATION CONTROLS */}
      {!loading && gifts.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{" "}
            <span className="font-bold text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, gifts.length)}</span> of{" "}
            <span className="font-bold text-gray-900">{gifts.length}</span> store gifts (Page {currentPage} of {totalPages})
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  currentPage === page
                    ? "bg-purple-600 text-white shadow-xs"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 🎥 VIDEO MODAL */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-2xl max-w-lg w-full">
            <video
              src={previewVideo}
              controls
              autoPlay
              className="max-h-[70vh] w-full rounded-xl"
            />
            <button
              onClick={() => setPreviewVideo(null)}
              className="mt-3 w-full bg-rose-600 text-white font-semibold py-2 rounded-xl text-sm hover:bg-rose-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {openAdd && (
        <AddStoreGiftModal
          close={() => setOpenAdd(false)}
          onSuccess={() => fetchGifts(selectedType)}
        />
      )}

      {openAddCategory && (
        <AddStoreCategoryModal close={() => setOpenAddCategory(false)} />
      )}

      {editingGift && (
        <EditStoreGiftModal
          gift={editingGift}
          close={() => setEditingGift(null)}
          onSuccess={() => fetchGifts(selectedType)}
        />
      )}
    </div>
  );
}
