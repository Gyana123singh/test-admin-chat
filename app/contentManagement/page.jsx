import { ImageIcon, Tag, Megaphone, Monitor } from "lucide-react";

const Card = ({ icon: Icon, title, emptyText, btnText }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between min-h-[180px]">
      <div className="flex items-center gap-2 font-semibold text-lg">
        <Icon className="w-5 h-5" />
        {title}
      </div>

      <p className="text-gray-500 text-center mt-6">{emptyText}</p>

      <div className="flex justify-end mt-6">
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
          + {btnText}
        </button>
      </div>
    </div>
  );
};

export default function CMSPage() {
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
        />

        <Card
          icon={Tag}
          title="Offers"
          emptyText="No offers added yet."
          btnText="Add Offer"
        />

        <Card
          icon={Monitor}
          title="Ads"
          emptyText="No ads added yet."
          btnText="Add Ad"
        />

        <Card
          icon={Megaphone}
          title="Popups"
          emptyText="No popups added yet."
          btnText="Add Popup"
        />
      </div>
    </div>
  );
}
