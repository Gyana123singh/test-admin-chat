"use client";
import axios from "axios";
import { useState } from "react";

const CATEGORY_TYPES = [
  "ENTRANCE",
  "FRAME",
  "RING",
  "BUBBLE",
  "THEME",
  "EMOJI",
  "NONE",
];

export default function AddCategoryModal({ close, onCategoryAdded }) {
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!type) {
      setError("Please select a category type");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/store-gifts/addStoreCategory",
        { type }, // 🔥 send enum type
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onCategoryAdded?.(res.data.data);
      close();
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Failed to add category");
      } else if (err.request) {
        setError("Backend not responding");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[450px]">
        <h2 className="text-xl font-bold mb-4">Add Store Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CATEGORY TYPE SELECT */}
          <div>
            <label className="text-sm font-semibold block mb-1">
              Select Category Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">-- Select Type --</option>
              {CATEGORY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg disabled:opacity-60"
            >
              {loading ? "Saving..." : "Add Category"}
            </button>

            <button
              type="button"
              onClick={close}
              className="flex-1 border border-red-500 text-red-500 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
