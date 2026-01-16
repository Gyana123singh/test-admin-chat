"use client";

import { useState } from "react";
import axios from "axios";

export default function AddGiftPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      formData.append("category", category); // ✅ string
      if (file) {
        formData.append("icon", file);
      }

      await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/store-gifts/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Gift created successfully");
      window.history.back();
    } catch (err) {
      console.error("❌ Create Gift Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong");
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
            <label className="block text-sm font-medium mb-1">Gift Name</label>
            <input
              type="text"
              placeholder="Enter gift name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Coin Cost */}
          <div>
            <label className="block text-sm font-medium mb-1">Coin Cost</label>
            <input
              type="number"
              placeholder="Enter coin cost"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              placeholder="Enter category (e.g. Love, Funny, VIP)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Gift Image / Animation
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-400 text-white py-3 rounded-xl hover:bg-purple-500 transition disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Gift"}
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full text-red-500 text-center mt-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
