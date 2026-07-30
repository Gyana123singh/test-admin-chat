"use client";

import dynamic from "next/dynamic";

// 🔥 Load Sidebar only on client
const Sidebar = dynamic(() => import("./components/Sidebar/Sidebar"), {
  ssr: false,
});

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen overflow-x-hidden w-full">{children}</main>
    </div>
  );
};

export default AdminLayout;
