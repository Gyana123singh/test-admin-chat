// src/admin/component/Modal/ModalComponent.jsx
import { X } from "lucide-react";

export default function ModalComponent({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 ">
      <div className="">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:bg-blue-800 cursor-pointer rounded text-gray-500 hover:text-gray-100"
        >
          {/* <X size={40} /> */}
        </button>
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
