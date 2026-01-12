// src/admin/component/CMS/AdModal.jsx
"use client";
export default function AdModal({ onClose }) {
  return (
    <form className="space-y-4">
      <input
        type="file"
        accept="image/*,video/*"
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Ad Link"
        className="w-full border p-2 rounded"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button className="bg-black text-white px-4 py-2 rounded">
          Save Ad
        </button>
      </div>
    </form>
  );
}
