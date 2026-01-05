"use client";
import { useState } from "react";

export default function AddBannerModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    link: "",
    status: "active",
    image: null,
    preview: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = () => {
    onSave(form); // send to API
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Banner</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium">Banner Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Summer Sale"
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-sm font-medium">Redirect URL</label>
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleChange}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="mt-1 block w-full text-sm"
            />

            {form.preview && (
              <img
                src={form.preview}
                alt="Preview"
                className="mt-3 h-40 w-full rounded-md object-cover"
              />
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            Save Banner
          </button>
        </div>
      </div>
    </div>
  );
}
