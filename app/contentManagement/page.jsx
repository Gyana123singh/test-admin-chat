"use client";

import { useState } from "react";
import AddBannerModal from "../contentManagement/AddBannerModal";
import {
  Image,
  Tag,
  MonitorPlay,
  Megaphone,
  Plus,
  Edit,
  Trash,
} from "lucide-react";

export default function CMSPage() {
  const [open, setOpen] = useState(false);

  const [banners] = useState([]);
  const [offers] = useState([]);
  const [ads] = useState([]);
  const [popups] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">
        📰 CMS (Content Management System)
      </h1>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------ REUSABLE CMS CARD ------------------------ */
/* ------------------------------------------------------------------ */

function CMSCard({ title, icon, btnText, items }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-gray-200 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <button className="bg-black text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900">
          <Plus className="w-4" /> {btnText}
        </button>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          No {title.toLowerCase()} added yet.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  className="w-20 h-14 object-cover rounded-md border"
                />
                <p className="font-medium">{item.title}</p>
              </div>

              <div className="flex gap-3">
                <button
                  className="p-2 rounded-lg bg-blue-100"
                  onClick={() => setOpen(true)}
                >
                  <Edit className="w-4 text-blue-600" />
                </button>

                <button className="p-2 rounded-lg bg-red-100">
                  <Trash className="w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddBannerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
