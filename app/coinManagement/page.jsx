"use client";

import { useState } from "react";
import { Plus, Wallet, IndianRupee, Coins, Minus, Search } from "lucide-react";

export default function CoinManagement() {
  const [plans, setPlans] = useState([
    { id: 1, inr: 100, coins: 1000, bonus: 50 },
    { id: 2, inr: 500, coins: 5500, bonus: 300 },
    { id: 3, inr: 1000, coins: 12000, bonus: 1000 },
  ]);

  const [transactions] = useState([
    { user: "Rahul", type: "Added", coins: "+500", date: "10/12/2024" },
    { user: "Neha", type: "Deducted", coins: "-200", date: "11/12/2024" },
    { user: "Ravi", type: "Recharge", coins: "+1200", date: "12/12/2024" },
  ]);

  const userStats = [
    { user: "Rahul", recharge: 1200, total: 1500, used: 300, remaining: 1200 },
    { user: "Neha", recharge: 800, total: 900, used: 500, remaining: 400 },
    { user: "Ravi", recharge: 2000, total: 2500, used: 1200, remaining: 1300 },
  ];

  return (
    <div className="p-8 w-full bg-[#f8f9fc] overflow-y-auto h-screen min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Coin Wallet & Recharge</h1>
      <p className="text-gray-500 mb-6">/ Coin Management</p>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        
        {/* RECHARGE PLANS */}
        <div className="bg-white p-6 shadow-md rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recharge Plans</h2>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700">
              <Plus size={18} /> Add Plan
            </button>
          </div>

          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border bg-purple-50 hover:bg-purple-100 duration-150"
              >
                <p className="font-semibold">
                  ₹{p.inr} → <span className="text-purple-700">{p.coins} Coins</span>
                </p>
                <p className="text-sm text-green-600">Bonus: {p.bonus} coins</p>
              </div>
            ))}
          </div>
        </div>

        {/* INR TO COIN MAPPING */}
        <div className="bg-white p-6 shadow-md rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">INR → Coin Mapping</h2>

          <div className="flex items-center gap-3 mb-4">
            <IndianRupee className="text-purple-600" />
            <input
              type="number"
              placeholder="1 INR equals how many coins?"
              className="border p-2 rounded-xl w-full"
            />
          </div>

          <button className="w-full bg-purple-600 text-white py-2 rounded-xl">
            Update Mapping
          </button>
        </div>

        {/* MANUAL COIN CONTROL */}
        <div className="bg-white p-6 shadow-md rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Manual Coin Update</h2>

          <input
            type="text"
            placeholder="Enter User Email"
            className="border p-2 w-full rounded-xl mb-3"
          />

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-green-600 text-white flex items-center justify-center gap-2 py-2 rounded-xl">
              <Coins size={18} /> Add Coins
            </button>
            <button className="bg-red-600 text-white flex items-center justify-center gap-2 py-2 rounded-xl">
              <Minus size={18} /> Deduct Coins
            </button>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS */}
      <div className="bg-white p-6 shadow-md rounded-2xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Transactions</h2>

          <div className="flex items-center gap-2 border px-3 py-2 rounded-xl">
            <Search size={18} className="text-gray-500" />
            <input type="text" placeholder="Search user..." className="outline-none" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Type</th>
              <th className="p-3">Coins</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3 flex items-center gap-2">
                  <Wallet className="text-purple-600" />
                  {t.user}
                </td>
                <td className="p-3">{t.type}</td>
                <td
                  className={`p-3 font-semibold ${
                    t.coins.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.coins}
                </td>
                <td className="p-3">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER STATISTICS */}
      <div className="bg-white p-6 shadow-md rounded-2xl mt-10">
        <h2 className="text-xl font-semibold mb-4">User Statistics</h2>

        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Total Recharge (₹)</th>
              <th className="p-3">Total Coins</th>
              <th className="p-3">Used Coins</th>
              <th className="p-3">Remaining Coins</th>
            </tr>
          </thead>

          <tbody>
            {userStats.map((u, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3 flex items-center gap-2">
                  <Wallet className="text-purple-600" />
                  {u.user}
                </td>
                <td className="p-3 font-medium">₹{u.recharge}</td>
                <td className="p-3">{u.total} Coins</td>
                <td className="p-3 text-red-600 font-semibold">{u.used}</td>
                <td className="p-3 text-green-600 font-semibold">{u.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
