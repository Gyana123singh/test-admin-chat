"use client";
import axios from "axios";
import { useState } from "react";

const CATEGORY_TYPES = ["HOT", "LUCKY", "SIV", "CUSTOMIZED", "BAG", "NONE"];

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
        "https://api.dilvoicechat.fun/api/gift/addCategory",
        { type },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ backend success check
      if (res.data?.success) {
        onCategoryAdded?.(res.data.data);
        close();
      } else {
        setError(res.data?.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Add category error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Server not responding");
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
          {/* CATEGORY TYPE */}
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

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

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
