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
     FETCH CATEGORIES
  =============================== */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          "https://chat-app-1-qvl9.onrender.com/api/gift/getCategory"
        );
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Category fetch failed", err);
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

    if (!form.name || !form.price || !form.category || !imageFile) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("icon", imageFile); // multer.single("icon")

      await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/store-gifts/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onSuccess?.();
      close();

      setForm({ name: "", price: "", category: "" });
      setImageFile(null);
      setPreview("");
    } catch (error) {
      console.error("Gift add failed:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[400px]">
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

          {/* CATEGORY */}
          <label className="text-sm font-semibold">Category</label>
          <div className="relative mb-3" ref={dropdownRef}>
            <div
              className="border p-2 rounded cursor-pointer bg-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {categories.find((c) => c._id === form.category)?.name ||
                "Select Category"}
            </div>

            {isOpen && (
              <div className="absolute z-50 bg-white border rounded mt-1 max-h-40 overflow-y-auto w-full shadow-md">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="p-2 hover:bg-purple-100 cursor-pointer"
                    onClick={() => {
                      setForm({ ...form, category: cat._id });
                      setIsOpen(false);
                    }}
                  >
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* IMAGE */}
          <label className="text-sm font-semibold">Gift Image</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file.type.startsWith("image/")) {
                alert("Only image files allowed");
                return;
              }
              setImageFile(file);
              setPreview(URL.createObjectURL(file));
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
