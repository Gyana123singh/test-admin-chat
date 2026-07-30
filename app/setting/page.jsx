"use client";

import { useState } from "react";
import {
  Save,
  Image,
  Palette,
  Settings,
  CreditCard,
  FileText,
  Bell,
} from "lucide-react";

export default function AppSettings() {
  const [logo, setLogo] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">⚙️ App Settings</h1>
      <p className="text-gray-500 text-xs sm:text-sm mb-6">Configure platform branding, payment keys, coin rules, and legal documents.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ----------- App Branding ----------- */}
        <div className="bg-white shadow-xs rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">App Branding</h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Logo Upload */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">App Logo</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full overflow-hidden">
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 border border-gray-200 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  {logo ? (
                    <img src={URL.createObjectURL(logo)} className="w-full h-full object-cover" />
                  ) : (
                    <Image className="text-gray-400 w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 w-full overflow-hidden">
                  <input
                    type="file"
                    className="w-full max-w-full text-xs text-gray-500 border border-gray-300 rounded-xl p-2 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer overflow-hidden truncate"
                    onChange={(e) => setLogo(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            {/* App Name */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">App Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter app name"
                defaultValue="Dil Voice Chat"
              />
            </div>

            {/* Theme Color */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">Theme Color</label>
              <div className="flex items-center gap-3">
                <Palette className="text-purple-600 w-5 h-5 shrink-0" />
                <input
                  type="color"
                  className="w-12 h-10 rounded-xl border border-gray-300 overflow-hidden cursor-pointer"
                  defaultValue="#9333ea"
                />
              </div>
            </div>

            <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap">
              <Save className="w-4 h-4" /> <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* ----------- Coin System ----------- */}
        <div className="bg-white shadow-xs rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Coin System</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">INR → Coin Rate</label>
              <input
                type="number"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Example: 1 INR = 10 Coins"
                defaultValue="10"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">Bonus Coins (%)</label>
              <input
                type="number"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Example: 20"
                defaultValue="15"
              />
            </div>

            <button className="mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap">
              <Save className="w-4 h-4" /> <span>Save Coin Settings</span>
            </button>
          </div>
        </div>

        {/* ----------- Payment Gateway ----------- */}
        <div className="bg-white shadow-xs rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Payment Gateway</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">Razorpay Key ID</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter Razorpay Key"
                defaultValue="rzp_live_xxxxxxxxxxxxx"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">Stripe Secret Key</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Enter Stripe Secret Key"
              />
            </div>

            <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap">
              <Save className="w-4 h-4" /> <span>Save Payment Keys</span>
            </button>
          </div>
        </div>

        {/* ----------- Terms & Privacy ----------- */}
        <div className="bg-white shadow-xs rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Legal Documents</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">
                Terms & Conditions
              </label>
              <textarea
                rows="3"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                placeholder="Write terms & conditions..."
              />
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-gray-700">Privacy Policy</label>
              <textarea
                rows="3"
                className="w-full border border-gray-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                placeholder="Write privacy policy..."
              />
            </div>

            <button className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap">
              <Save className="w-4 h-4" /> <span>Save Legal Docs</span>
            </button>
          </div>
        </div>

        {/* ----------- Notification Settings ----------- */}
        <div className="bg-white shadow-xs rounded-2xl p-6 border border-gray-200 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">Notification Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {[
              "New User Registration",
              "Recharge Success",
              "Gift Received",
              "Report Submitted",
              "Call Started",
              "Call Ended",
            ].map((item, index) => (
              <label
                key={index}
                className="flex items-center gap-3 bg-gray-50 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100/70 transition"
              >
                <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                <span className="text-xs font-semibold text-gray-700">{item}</span>
              </label>
            ))}
          </div>

          <button className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap">
            <Save className="w-4 h-4" /> <span>Save Notification Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
