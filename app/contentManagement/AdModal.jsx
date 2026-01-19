"use client";

import { useState } from "react";
import ModalComponent from "../components/modal/ModalComponents";
import { Upload } from "lucide-react";
import axios from "axios";

export default function AdModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [redirectLink, setRedirectLink] = useState("");
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
      alert("Please upload ad media");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", file); // 🔥 MUST be 'file'
      formData.append("redirectLink", redirectLink);

      await axios.post(
        "https://chat-app-1-qvl9.onrender.com/api/promotion/create-ads",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      alert("Ad created successfully ✅");
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create advertisement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalComponent title="Create Advertisement" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Upload Box */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">Upload Image / GIF / Video</p>

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
            {file?.type.startsWith("video") ? (
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

        {/* Redirect Link */}
        <input
          type="text"
          placeholder="Ad Redirect Link (https://...)"
          value={redirectLink}
          onChange={(e) => setRedirectLink(e.target.value)}
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
            disabled={loading}
            className="px-5 py-2 bg-black text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Save Ad"}
          </button>
        </div>
      </form>
    </ModalComponent>
  );
}
