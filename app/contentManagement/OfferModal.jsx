// src/admin/component/CMS/OfferModal.jsx
export default function OfferModal({ onClose }) {
  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Offer Title"
        className="w-full border p-2 rounded"
      />

      <textarea
        placeholder="Offer Description"
        className="w-full border p-2 rounded"
      />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="border px-4 py-2 rounded">
          Cancel
        </button>
        <button className="bg-black text-white px-4 py-2 rounded">
          Save Offer
        </button>
      </div>
    </form>
  );
}
