"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function AddStoreGiftModal({ close, onSuccess }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [validityDays, setValidityDays] = useState(7);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     FETCH CATEGORIES (FIXED)
  =============================== */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://api.dilvoicechat.fun/api/store-gifts/getStoreCategory"
      );

      if (res.data?.success && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("❌ Fetch categories failed:", error);
      setCategories([]); // prevent crash
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ===============================
     SUBMIT
  =============================== */
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
      formData.append("category", category); // ✅ string
      if (file) {
        formData.append("icon", file);
      }

      await axios.post(
        "https://api.dilvoicechat.fun/api/store-gifts/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Gift created successfully ✅");
      onSuccess?.();
      if (close) close();
      else window.history.back();
    } catch (err) {
      console.error("❌ Create Gift Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (close) close();
    else window.history.back();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 pr-8">Add New Store Gift</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gift Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Gift Name</label>
            <input
              type="text"
              placeholder="Enter gift name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Coin Cost */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Coin Cost</label>
            <input
              type="number"
              placeholder="Enter coin cost"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* CATEGORY SELECT */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select Category</option>

              {categories.map((cat, index) => (
                <option key={index} value={cat.type}>
                  {cat.type}
                </option>
              ))}
            </select>
          </div>

          {/* Validity Days (Shown for all categories except RING) */}
          {category?.toUpperCase() !== "RING" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Validity (Days)</label>
              <input
                type="number"
                placeholder="Enter days (e.g. 3, 7, 20)"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              {/* Quick preset buttons */}
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Gift Image / Animation
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Gift"}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full text-gray-600 hover:text-gray-900 font-medium mt-2 py-1 text-center cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
