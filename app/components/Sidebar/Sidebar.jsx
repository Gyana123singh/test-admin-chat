"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, LogOut } from "lucide-react";
import { logout } from "../../utils/logout";

function Sidebar() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  // Load saved sidebar state + active menu on page load
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    if (savedState !== null) {
      setOpen(JSON.parse(savedState));
    }

    const savedActive = localStorage.getItem("activeMenu");
    if (savedActive) {
      setActiveMenu(savedActive);
    }
  }, []);

  // Toggle desktop sidebar and save
  const toggleSidebar = () => {
    setOpen((prevState) => {
      const newState = !prevState;
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
      return newState;
    });
  };

  // Menu items list
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", image: "/User.png" },
    { name: "User Management", path: "/userManagement", image: "/User.png" },
    { name: "Help Line Rooms", path: "/helpLine", image: "/Folder.png" },
    { name: "Gifts Management", path: "/giftsManagement", image: "/User.png" },
    {
      name: "Gifts Store Management",
      path: "/giftStoreManagement",
      image: "/User.png",
    },
    { name: "Chat Reports", path: "/chatReport", image: "/Calendar.png" },
    { name: "Coin Management", path: "/coinManagement", image: "/Chart.png" },
    {
      name: "Content Management",
      path: "/contentManagement",
      image: "/Chart.png",
    },
    {
      name: "Revenue Analytics",
      path: "/revenueAnalytics",
      image: "/Chart.png",
    },
    {
      name: "Join",
      path: "/join",
      image: "/Chart.png",
    },
    {
      name: "Profit & Loss",
      path: "/profitLoss",
      image: "/Chart.png",
    },
    { name: "Settings", path: "/setting", image: "/Folder.png" },
  ];

  // Handle click and store active menu
  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    localStorage.setItem("activeMenu", menuName);
    setMobileOpen(false); // Close mobile drawer when link clicked
  };

  return (
    <>
      {/* ================= MOBILE HEADER TOP BAR (< lg) ================= */}
      <div className="lg:hidden w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-x-2.5">
          <Image
            src="/Dil (2).png"
            width={34}
            height={34}
            className="w-8.5 h-8.5"
            alt="logo"
          />
          <h1 className="text-blue-600 font-bold text-lg tracking-wide">
            Dil Admin
          </h1>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
          aria-label="Toggle Mobile Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ================= MOBILE SLIDE-OVER DRAWER (< lg) ================= */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-x-2.5">
                <Image
                  src="/Dil (2).png"
                  width={34}
                  height={34}
                  className="w-8.5 h-8.5"
                  alt="logo"
                />
                <h1 className="text-blue-600 font-bold text-lg">Dil Admin</h1>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {menuItems.map((menu, index) => {
                const isActive = activeMenu === menu.name;
                return (
                  <Link
                    key={index}
                    href={menu.path}
                    onClick={() => handleMenuClick(menu.name)}
                    className={`flex items-center gap-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Image
                      src={menu.image}
                      width={22}
                      height={22}
                      className="w-5 h-5 shrink-0"
                      alt={menu.name}
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                    <span>{menu.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Footer */}
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-x-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR (>= lg) ================= */}
      <aside
        className={`hidden lg:block sticky top-0 h-screen shrink-0 z-30 transition-all duration-300 ease-in-out ${
          open ? "w-72" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full bg-white shadow-xs border-r border-gray-200 relative select-none">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            className="absolute -right-3.5 top-9 z-40 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-transform duration-300 focus:outline-none cursor-pointer"
          >
            <Image
              src="/control.png"
              width={16}
              height={16}
              className={`w-4 h-4 transition-transform duration-300 ${
                !open ? "rotate-180" : ""
              }`}
              alt="toggle"
            />
          </button>

          {/* Logo Section */}
          <div className="flex items-center gap-x-3 p-4 border-b border-gray-100 shrink-0 h-20 overflow-hidden">
            <Image
              src="/Dil (2).png"
              width={40}
              height={40}
              className="w-10 h-10 shrink-0 duration-300"
              alt="logo"
            />
            <h1
              className={`text-blue-600 font-bold text-xl tracking-wide duration-200 whitespace-nowrap overflow-hidden ${
                !open ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              Dil Admin
            </h1>
          </div>

          {/* Menu List Container */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
            {menuItems.map((menu, index) => {
              const isActive = activeMenu === menu.name;
              return (
                <Link
                  key={index}
                  href={menu.path}
                  onClick={() => handleMenuClick(menu.name)}
                  className={`flex items-center gap-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 border-l-4 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Image
                    src={menu.image}
                    width={22}
                    height={22}
                    className="w-5 h-5 shrink-0"
                    alt={menu.name}
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                      !open ? "opacity-0 w-0" : "opacity-100 w-auto"
                    }`}
                  >
                    {menu.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Logout Section */}
          <div className="p-2 border-t border-gray-100 shrink-0">
            <button
              onClick={logout}
              className="w-full flex items-center gap-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 border-l-4 border-transparent transition-colors duration-150 cursor-pointer"
            >
              <Image
                src="/Setting.png"
                width={22}
                height={22}
                className="w-5 h-5 shrink-0"
                alt="Logout"
              />
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
                  !open ? "opacity-0 w-0" : "opacity-100 w-auto"
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
