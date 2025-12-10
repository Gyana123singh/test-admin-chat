"use client";
import { useState } from "react";

export default function EditGiftModal({ close, gift, updateGift }) {
  const [preview, setPreview] = useState(gift.image);
  const [form, setForm] = useState(gift);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateGift({ ...form, image: preview });
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-[400px]">
        <h2 className="text-xl font-bold mb-4">Edit Gift</h2>

        <form onSubmit={handleSubmit}>
          <label className="text-sm font-semibold">Gift Name</label>
          <input
            className="border p-2 rounded w-full mb-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label className="text-sm font-semibold">Coin Cost</label>
          <input
            type="number"
            className="border p-2 rounded w-full mb-3"
            value={form.coinCost}
            onChange={(e) => setForm({ ...form, coinCost: e.target.value })}
          />

          <label className="text-sm font-semibold">Category</label>
          <select
            className="border p-2 rounded w-full mb-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option>Romantic</option>
            <option>Funny</option>
            <option>Luxury</option>
            <option>Holiday</option>
          </select>

          <label className="text-sm font-semibold">Change Image</label>
          <input
            type="file"
            accept="image/png,image/apng"
            onChange={(e) => setPreview(URL.createObjectURL(e.target.files[0]))}
            className="mb-3"
          />

          {preview && (
            <img src={preview} className="w-24 border rounded mb-3" />
          )}

          <button className="bg-blue-600 text-white w-full py-2 rounded">
            Save Changes
          </button>
        </form>

        <button onClick={close} className="text-red-500 mt-3 w-full">
          Cancel
        </button>
      </div>
    </div>
  );
}
