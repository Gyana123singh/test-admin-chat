"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function AddGiftModal({ close, onSuccess }) {
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    animationUrl: "",
    rarity: "COMMON",
    effectType: "",
  });

  /* ===============================
     FETCH CATEGORIES
  =============================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://chat-app-1-qvl9.onrender.com/api/store-gifts/getStoreCategory"
        );
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("❌ Fetch category error:", err);
      }
    };

    fetchCategories();
  }, []);

  /* ===============================
     HANDLE INPUT CHANGE
  =============================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===============================
     HANDLE IMAGE SELECT
  =============================== */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ===============================
     SUBMIT FORM
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price || !form.category) {
      setError("Name, price and category are required");
      return;
    }

    if (!imageFile) {
      setError("Gift icon image is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("animationUrl", form.animationUrl);
      formData.append("rarity", form.rarity);
      formData.append("effectType", form.effectType);
      formData.append("icon", imageFile); // 🔥 MUST MATCH BACKEND

      const res = await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/store-gifts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onSuccess?.(res.data.data);
      close();
    } catch (err) {
      console.error("❌ Gift add failed:", err);
      setError(err.response?.data?.message || "Gift add failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4">Add New Gift</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Gift name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* PRICE */}
          <input
            type="number"
            name="price"
            placeholder="Price (coins)"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* CATEGORY */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>

          {/* RARITY */}
          <select
            name="rarity"
            value={form.rarity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="COMMON">COMMON</option>
            <option value="RARE">RARE</option>
            <option value="EPIC">EPIC</option>
            <option value="LEGENDARY">LEGENDARY</option>
          </select>

          {/* EFFECT TYPE */}
          <input
            type="text"
            name="effectType"
            placeholder="Effect type (optional)"
            value={form.effectType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* ANIMATION URL */}
          <input
            type="text"
            name="animationUrl"
            placeholder="Animation URL (optional)"
            value={form.animationUrl}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* IMAGE */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="w-20 h-20 object-cover rounded"
            />
          )}

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Adding..." : "Add Gift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
