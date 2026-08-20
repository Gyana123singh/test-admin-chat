"use client";

import { useEffect, useState } from "react";
import instanceApi from "../utils/api/axiosConfig";
import { X, RefreshCw } from "lucide-react";

export default function EditStoreGiftModal({ gift, close, onSuccess }) {
  const [name, setName] = useState(gift?.name || "");
  const [price, setPrice] = useState(gift?.price || "");
  const [validityDays, setValidityDays] = useState(gift?.validityDays || gift?.days || 7);
  const [category, setCategory] = useState(gift?.category || "");
  const [categories, setCategories] = useState([]);
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(gift?.icon || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await instanceApi.get("/api/store-gifts/getStoreCategory");
      if (res.data?.success && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error("Fetch store categories error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !price || !category) {
      setError("Name, price and category are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("validityDays", validityDays || 7);
      formData.append("category", category);

      if (icon) {
        formData.append("icon", icon);
      } else if (iconPreview) {
        formData.append("icon", iconPreview);
      }

      const res = await instanceApi.put(
        `/api/store-gifts/update/${gift._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.success) {
        alert("Store Gift updated successfully ✅");
        onSuccess?.();
        close?.();
      } else {
        setError(res.data?.message || "Failed to update store gift");
      }
    } catch (err) {
      console.error("Update store gift error:", err);
      setError(err.response?.data?.message || "Server error updating store gift");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={close}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 pr-8">Edit Store Gift</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview Image / Video */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-purple-50 rounded-xl overflow-hidden border border-purple-100 flex items-center justify-center shrink-0">
              {iconPreview ? (
                iconPreview.endsWith(".mp4") ? (
                  <video src={iconPreview} muted loop autoPlay className="w-full h-full object-contain p-1" />
                ) : (
                  <img src={iconPreview} alt="preview" className="w-full h-full object-contain p-1" />
                )
              ) : (
                <span className="text-xs text-gray-400">No Media</span>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1 text-gray-700">Change Media / Icon</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIcon(file);
                    setIconPreview(URL.createObjectURL(file));
                  }
                }}
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Gift Name */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Store Gift Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter gift name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Coin Price *
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter coin cost"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat.type}>
                  {cat.type}
                </option>
              ))}
            </select>
          </div>

          {/* Validity Days (Shown for all categories except RING) */}
          {category?.toUpperCase() !== "RING" && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Validity (Days) *
              </label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                min="1"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter validity in days (e.g. 3, 7, 20)"
              />
              <div className="flex gap-2 mt-2">
                {[3, 7, 20, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValidityDays(d)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      Number(validityDays) === d
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>

          <button
            type="button"
            onClick={close}
            className="w-full text-gray-600 hover:text-gray-900 text-sm font-semibold mt-1 py-1 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
