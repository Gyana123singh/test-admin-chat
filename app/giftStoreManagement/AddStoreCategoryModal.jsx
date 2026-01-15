"use client";
import axios from "axios";
import { useState } from "react";

export default function AddStoreCategoryModal({ close, onCategoryAdded }) {
  const [type, setType] = useState(""); // ✅ NEW
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!type) {
      setError("Category type is required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/store-gifts/addStoreCategory",
        {
          type, // ✅ SEND TYPE
        },
        { withCredentials: true }
      );

      onCategoryAdded?.(res.data.data);

      setType("");
      close();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.request ? "Backend not responding" : "Something went wrong")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[450px]">
        <h2 className="text-xl font-bold mb-4">Add Gift Store Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CATEGORY NAME */}

          {/* CATEGORY TYPE */}
          <div>
            <label className="text-sm font-semibold block mb-1">
              Category Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select type</option>
              <option value="ENTRANCE">Entrance Effect</option>
              <option value="FRAME">Profile Frame</option>
              <option value="RING">Profile Ring</option>
              <option value="BUBBLE">Chat Bubble</option>
              <option value="THEME">Theme</option>
              <option value="NORMAL">Normal Gift</option>
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
