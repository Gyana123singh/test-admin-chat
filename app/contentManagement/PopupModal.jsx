// src/admin/component/CMS/PopupModal.jsx
export default function PopupModal({ onClose }) {
  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Popup Title"
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Popup Content"
        className="w-full border p-2 rounded"
      />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="border px-4 py-2 rounded">
          Cancel
        </button>
        <button className="bg-black text-white px-4 py-2 rounded">
          Save Popup
        </button>
      </div>
    </form>
  );
}
