"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AddGiftPage() {
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
        window.history.back();
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

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Add New Gift</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gift Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Gift Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter gift name"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Coin Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter coin cost"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white"
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
            <label className="block text-sm font-medium mb-1">
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
            className="w-full bg-purple-500 text-white py-3 rounded-xl"
          >
            {loading ? "Adding..." : "Add Gift"}
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full text-red-500 mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
