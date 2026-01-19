"use client";

import { useState } from "react";
import axios from "axios";

export default function BannerModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload banner media");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file); // 🔥 required by multer
      formData.append("redirectUrl", redirectUrl);

      await axios.post(
        "https://api.dilvoicechat.fun/api/promotion/create-banner",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("Banner created successfully ✅");
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upload */}
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,video/mp4,video/webm"
        onChange={handleFileChange}
        className="w-full border p-2 rounded"
      />

      {/* Preview */}
      {preview && (
        <div className="border rounded overflow-hidden">
          {file?.type.startsWith("video") ? (
            <video
              src={preview}
              controls
              className="w-full h-40 bg-black object-contain"
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

      {/* Redirect URL */}
      <input
        type="text"
        placeholder="Redirect URL"
        value={redirectUrl}
        onChange={(e) => setRedirectUrl(e.target.value)}
        className="w-full border p-2 rounded"
      />

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Save Banner"}
        </button>
      </div>
    </form>
  );
}
