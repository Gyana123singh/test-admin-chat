// src/admin/component/CMS/AdModal.jsx
"use client";

import { useState } from "react";
import ModalComponent from "../components/modal/ModalComponent";
import { Upload } from "lucide-react";

export default function AdModal({ onClose }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
  };

  return (
    <ModalComponent title="Create Advertisement" onClose={onClose}>
      <form className="space-y-5">
        {/* Upload Box */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Upload Image / GIF / Video
          </p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,video/mp4,video/webm"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Preview */}
        {preview && (
          <div className="rounded-lg overflow-hidden border">
            {preview.includes("video") ? (
              <video
                src={preview}
                controls
                className="w-full h-40 object-contain bg-black"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-full h-40 object-contain"
              />
            )}
          </div>
        )}

        {/* Ad Link */}
        <input
          type="text"
          placeholder="Ad Redirect Link (https://...)"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-black text-white rounded-lg hover:opacity-90"
          >
            Save Ad
          </button>
        </div>
      </form>
    </ModalComponent>
  );
}

