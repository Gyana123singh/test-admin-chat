// src/admin/pages/CMSPage.jsx
import { useState } from "react";
import { ImageIcon, Tag, Megaphone, Monitor } from "lucide-react";
import ModalComponent from "../components/modal/ModalComponents";

import BannerModal from "../contentManagement/BannerModal";
import OfferModal from "../contentManagement/OfferModal";
import AdModal from "../contentManagement/AdModal";
import PopupModal from "../contentManagement/PopupModal";

const Card = ({ icon: Icon, title, emptyText, btnText, onClick }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between min-h-[180px]">
    <div className="flex items-center gap-2 font-semibold text-lg">
      <Icon className="w-5 h-5" />
      {title}
    </div>

    <p className="text-gray-500 text-center mt-6">{emptyText}</p>

    <div className="flex justify-end mt-6">
      <button
        onClick={onClick}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
      >
        + {btnText}
      </button>
    </div>
  </div>
);

export default function CMSPage() {
  const [modal, setModal] = useState(null);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        📄 CMS (Content Management System)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          icon={ImageIcon}
          title="Banners"
          emptyText="No banners added yet."
          btnText="Add Banner"
          onClick={() => setModal("banner")}
        />

        <Card
          icon={Tag}
          title="Offers"
          emptyText="No offers added yet."
          btnText="Add Offer"
          onClick={() => setModal("offer")}
        />

        <Card
          icon={Monitor}
          title="Ads"
          emptyText="No ads added yet."
          btnText="Add Ad"
          onClick={() => setModal("ad")}
        />

        <Card
          icon={Megaphone}
          title="Popups"
          emptyText="No popups added yet."
          btnText="Add Popup"
          onClick={() => setModal("popup")}
        />
      </div>

      {/* MODALS */}
      {modal === "banner" && (
        <ModalComponent
          title="Add Banner (Image / GIF / Video)"
          onClose={() => setModal(null)}
        >
          <BannerModal onClose={() => setModal(null)} />
        </ModalComponent>
      )}

      {modal === "offer" && (
        <ModalComponent title="Add Offer" onClose={() => setModal(null)}>
          <OfferModal onClose={() => setModal(null)} />
        </ModalComponent>
      )}

      {modal === "ad" && (
        <ModalComponent title="Add Ad" onClose={() => setModal(null)}>
          <AdModal onClose={() => setModal(null)} />
        </ModalComponent>
      )}

      {modal === "popup" && (
        <ModalComponent title="Add Popup" onClose={() => setModal(null)}>
          <PopupModal onClose={() => setModal(null)} />
        </ModalComponent>
      )}
    </div>
  );
}
