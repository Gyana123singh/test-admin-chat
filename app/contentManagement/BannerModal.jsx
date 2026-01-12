// src/admin/component/CMS/BannerModal.jsx
"use client";
import { useState, useEffect } from "react";

export default function BannerModal({ onClose }) {
  const [file, setFile] = useState(null);

  return (
    <form className="space-y-4">
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,video/mp4,video/webm"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        placeholder="Redirect URL"
        className="w-full border p-2 rounded"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button className="px-4 py-2 bg-black text-white rounded">
          Save Banner
        </button>
      </div>
    </form>
  );
}
