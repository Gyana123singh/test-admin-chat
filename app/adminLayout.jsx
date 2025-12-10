import React from "react";
import Sidebar from "./components/Sidebar/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div>
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
