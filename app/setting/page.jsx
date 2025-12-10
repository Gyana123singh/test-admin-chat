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
    <div className="min-h-screen overflow-y-auto h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">⚙️ App Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ----------- App Branding ----------- */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">App Branding</h2>
          </div>

          <div className="flex flex-col gap-4">
            {/* Logo Upload */}
            <div>
              <label className="block mb-1 font-medium">App Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {logo ? (
                    <img src={URL.createObjectURL(logo)} className="w-full" />
                  ) : (
                    <Image className="text-gray-400" />
                  )}
                </div>

                <input
                  type="file"
                  className="border rounded-lg p-2"
                  onChange={(e) => setLogo(e.target.files[0])}
                />
              </div>
            </div>

            {/* App Name */}
            <div>
              <label className="block mb-1 font-medium">App Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg"
                placeholder="Enter app name"
              />
            </div>

            {/* Theme Color */}
            <div>
              <label className="block mb-1 font-medium">Theme Color</label>
              <div className="flex items-center gap-4">
                <Palette className="text-purple-600" />
                <input
                  type="color"
                  className="w-12 h-12 rounded-lg overflow-hidden"
                />
              </div>
            </div>

            <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save className="w-4" /> Save Settings
            </button>
          </div>
        </div>

        {/* ----------- Coin System ----------- */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Coin System</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">INR → Coin Rate</label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg"
                placeholder="Example: 1 INR = 10 Coins"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Bonus Coins (%)</label>
              <input
                type="number"
                className="w-full border p-2 rounded-lg"
                placeholder="Example: 20"
              />
            </div>

            <button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save className="w-4" /> Save Coin Settings
            </button>
          </div>
        </div>

        {/* ----------- Payment Gateway ----------- */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Payment Gateway</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">Razorpay Key</label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg"
                placeholder="Enter Razorpay Key"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Stripe Secret</label>
              <input
                type="text"
                className="w-full border p-2 rounded-lg"
                placeholder="Enter Stripe Secret Key"
              />
            </div>

            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save className="w-4" /> Save Payment Keys
            </button>
          </div>
        </div>

        {/* ----------- Terms & Privacy ----------- */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Legal Documents</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">
                Terms & Conditions
              </label>
              <textarea
                rows="4"
                className="w-full border p-2 rounded-lg"
                placeholder="Write terms & conditions..."
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Privacy Policy</label>
              <textarea
                rows="4"
                className="w-full border p-2 rounded-lg"
                placeholder="Write privacy policy..."
              />
            </div>

            <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Save className="w-4" /> Save Legal Docs
            </button>
          </div>
        </div>

        {/* ----------- Notification Settings ----------- */}
        <div className="bg-white/70 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-gray-200 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">Notification Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="flex items-center gap-3 bg-gray-50 p-3 border rounded-lg"
              >
                <input type="checkbox" className="w-5 h-5" />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <button className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Save className="w-4" /> Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}
