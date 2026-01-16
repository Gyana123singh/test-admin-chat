"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function AddGiftModal({ close, onSuccess }) {
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    // 🔥 important (ENTRANCE, FRAME, etc.)
  });

  /* ===============================
     CLOSE DROPDOWN ON OUTSIDE CLICK
  =============================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     FETCH CATEGORIES (MATCH BACKEND)
  =============================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://chat-app-1-qvl9.onrender.com/api/store-gifts/getStoreCategory"
        );

        console.log("CATEGORY API RESPONSE:", res.data);

        // ✅ BACKEND RETURNS { success, count, categories }
        setCategories(
          Array.isArray(res.data.categories) ? res.data.categories : []
        );
      } catch (err) {
        console.error("❌ Category fetch failed", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  /* ===============================
     CLEANUP IMAGE PREVIEW
  =============================== */
  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  /* ===============================
     SUBMIT GIFT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("icon", imageFile);

      await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/store-gifts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onSuccess?.();
      close();

      setForm({ name: "", price: "", category: "", categoryType: "" });
      setImageFile(null);
      setPreview("");
    } catch (error) {
      console.error("❌ Gift add failed:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[420px]">
        <h2 className="text-xl font-bold mb-4">Add New Gift</h2>

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <label className="text-sm font-semibold">Gift Name</label>
          <input
            className="border p-2 rounded w-full mb-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          {/* PRICE */}
          <label className="text-sm font-semibold">Coin Cost</label>
          <input
            type="number"
            className="border p-2 rounded w-full mb-3"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />

          {/* CATEGORY DROPDOWN */}

          <label className="text-sm font-semibold">Category</label>
          <div className="relative mb-3" ref={dropdownRef}>
            <div
              className="border p-2 rounded cursor-pointer bg-white flex justify-between items-center"
              onClick={() => setIsOpen(!isOpen)}
            >
              {form.category
                ? categories.find((c) => c._id === form.category)?.type
                : "Select Category"}
              <span className="text-xs text-gray-400">▼</span>
            </div>

            {isOpen && categories.length > 0 && (
              <div className="absolute z-50 bg-white border rounded mt-1 max-h-52 overflow-y-auto w-full shadow-md">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="p-2 hover:bg-purple-100 cursor-pointer"
                    onClick={() => {
                      setForm({
                        ...form,
                        category: cat._id,
                        categoryType: cat.type, // 🔥 store type
                      });
                      setIsOpen(false);
                    }}
                  >
                    <span className="font-medium">{cat.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SHOW TYPE (WAFA STYLE) */}
          {form.categoryType && (
            <div className="mb-3 text-sm font-medium text-purple-600">
              Selected Type: {form.categoryType}
            </div>
          )}

          {/* IMAGE */}
          <label className="text-sm font-semibold">
            Gift Image / Animation
          </label>
          <input
            type="file"
            accept="image/*,video/mp4,application/json"
            required
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              setImageFile(file);

              if (file.type.startsWith("image/")) {
                setPreview(URL.createObjectURL(file));
              } else {
                setPreview(""); // for mp4/lottie no preview here
              }
            }}
            className="mb-3"
          />

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 object-cover border rounded mb-3"
            />
          )}

          {/* WAFA BEHAVIOR HINT */}
          {form.categoryType === "FRAME" && (
            <p className="text-xs text-blue-600 mb-2">
              This gift will be applied as profile frame
            </p>
          )}

          {form.categoryType === "ENTRANCE" && (
            <p className="text-xs text-green-600 mb-2">
              This gift will play full screen entrance animation
            </p>
          )}

          <button
            disabled={loading}
            className="bg-purple-600 text-white w-full py-2 rounded disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Gift"}
          </button>
        </form>

        <button onClick={close} className="text-red-500 mt-3 w-full">
          Cancel
        </button>
      </div>
    </div>
  );
}
