"use client";

import dynamic from "next/dynamic";

// 🔥 Load Sidebar only on client
const Sidebar = dynamic(() => import("./components/Sidebar/Sidebar"), {
  ssr: false,
});

const AdminLayout = ({ children }) => {
  return (
    <div className="flex w-full">
      <Sidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
};

export default AdminLayout;
