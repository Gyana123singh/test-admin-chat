"use client";
import { useState } from "react";

export default function AddGiftModal({ close, addGift }) {
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    coinCost: "",
    category: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newGift = {
      id: Date.now(),
      ...form,
      image: preview,
    };
    addGift(newGift);
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[400px]">
        <h2 className="text-xl font-bold mb-4">Add New Gift</h2>

        <form onSubmit={handleSubmit}>
          <label className="text-sm font-semibold">Gift Name</label>
          <input
            className="border p-2 rounded w-full mb-3"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label className="text-sm font-semibold">Coin Cost</label>
          <input
            type="number"
            className="border p-2 rounded w-full mb-3"
            onChange={(e) => setForm({ ...form, coinCost: e.target.value })}
          />

          <label className="text-sm font-semibold">Category</label>
          <select
            className="border p-2 rounded w-full mb-3"
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option>Romantic</option>
            <option>Funny</option>
            <option>Luxury</option>
            <option>Holiday</option>
          </select>

          <label className="text-sm font-semibold">Gift Image (PNG)</label>
          <input
            type="file"
            accept="image/png,image/apng"
            onChange={(e) => {
              const file = e.target.files[0];
              setPreview(URL.createObjectURL(file));
            }}
            className="mb-3"
          />

          {preview && (
            <img src={preview} className="w-24 border rounded mb-3" />
          )}

          <button className="bg-purple-600 text-white w-full py-2 rounded">
            Add Gift
          </button>
        </form>

        <button onClick={close} className="text-red-500 mt-3 w-full">
          Cancel
        </button>
      </div>
    </div>
  );
}
