"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function AddGiftModal({ close, onSuccess }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [icon, setIcon] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===============================
     FETCH CATEGORIES
  =============================== */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://api.dilvoicechat.fun/api/gift/getCategory"
      );

      if (res.data?.success && Array.isArray(res.data.categories)) {
        setCategories(res.data.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Fetch category error:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ===============================
     SUBMIT GIFT
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
      formData.append("category", category);

      if (icon) {
        formData.append("icon", icon);
      }

      const res = await axios.post(
        "https://api.dilvoicechat.fun/api/gift/addGift",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.success) {
        alert("Gift created successfully ✅");
        onSuccess?.();
        if (close) close();
        else window.history.back();
      } else {
        setError(res.data?.message || "Failed to create gift");
      }
    } catch (err) {
      console.error("Create gift error:", err);
      setError(err.response?.data?.message || "Server error");
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

        <h2 className="text-2xl font-bold mb-6 text-gray-900 pr-8">Add New Gift</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gift Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Gift Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter gift name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Coin Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter coin cost"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat.type}>
                  {cat.type}
                </option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Gift Icon (optional)
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setIcon(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

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
            className="w-full text-gray-600 hover:text-gray-900 font-medium mt-2 py-1 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
