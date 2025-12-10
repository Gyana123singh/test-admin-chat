"use client";
import { useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Sha",
      email: "sha@yopmail.com",
      phone: "9944928277",
      reg: "Date not available",
      country: "-",
      gender: "Male",
      status: "Active",
      lastSeen: "-",
      banned: false,
      wallet: 420,
      coinHistory: [{ date: "2024-11-10", amount: 200, type: "Added" }],
      calls: [{ date: "2024-11-07", duration: "10 min", cost: 50 }],
      gifts: [{ date: "2024-11-05", gift: "Rose", cost: 10 }],
      loginActivity: ["2024-11-13 2:57PM"],
      deviceInfo: "Android 12, Samsung",
    },
    {
      id: 2,
      name: "Sakthi",
      email: "sakthi@yopmail.com",
      phone: "3696514747",
      reg: "Date not available",
      country: "-",
      gender: "Female",
      status: "Active",
      lastSeen: "2:57:07 PM",
      banned: false,
      wallet: 120,
      coinHistory: [],
      calls: [],
      gifts: [],
      loginActivity: [],
      deviceInfo: "iPhone 13",
    },
    {
      id: 3,
      name: "Ajith",
      email: "ar@yopmail.com",
      phone: "9988776652",
      reg: "October 29, 2024",
      country: "India",
      gender: "Male",
      status: "Verified",
      lastSeen: "-",
      banned: false,
      wallet: 850,
      coinHistory: [],
      calls: [],
      gifts: [],
      loginActivity: [],
      deviceInfo: "Android 11",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  // Filters + Search
  const filtered = users.filter((u) => {
    return (
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (filterCountry ? u.country === filterCountry : true) &&
      (filterGender ? u.gender === filterGender : true) &&
      (filterStatus ? u.status === filterStatus : true)
    );
  });

  // Toggle Ban / Unban
  const toggleBan = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, banned: !u.banned } : u
      )
    );
  };

  return (
    <div className="p-6 overflow-y-auto h-screen ">
      <h1 className="text-3xl font-bold mb-4">Users Management</h1>

      {/* Search + Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded-md"
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
        >
          <option value="">Country</option>
          <option value="India">India</option>
          <option value="-">Unknown</option>
        </select>

        <select
          className="border p-2 rounded-md"
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
        >
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <select
          className="border p-2 rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option>Active</option>
          <option>Verified</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Country</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-300 rounded-full"></span>
                  {u.name}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone}</td>
                <td className="p-3">{u.country}</td>
                <td className="p-3">{u.status}</td>

                <td className="p-3 flex gap-2 justify-center">
                  <button
                    className={`px-3 py-1 rounded-md ${
                      u.banned ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                    onClick={() => toggleBan(u.id)}
                  >
                    {u.banned ? "Unban" : "Ban"}
                  </button>

                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded-md"
                    onClick={() => setSelectedUser(u)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER DETAILS SLIDE PANEL */}
      {selectedUser && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl p-6 overflow-y-auto">
          <button
            className="text-red-500 text-right w-full"
            onClick={() => setSelectedUser(null)}
          >
            Close ✕
          </button>

          <h2 className="text-2xl font-bold mb-2">{selectedUser.name}</h2>
          <p className="text-gray-600">{selectedUser.email}</p>

          <hr className="my-4" />

          <h3 className="font-semibold">Wallet Coins</h3>
          <p className="mb-3">{selectedUser.wallet} coins</p>

          <h3 className="font-semibold mt-4">Coin History</h3>
          {selectedUser.coinHistory.map((c, i) => (
            <p key={i} className="text-sm">
              {c.date} — {c.amount} ({c.type})
            </p>
          ))}

          <h3 className="font-semibold mt-4">Call History</h3>
          {selectedUser.calls.map((c, i) => (
            <p key={i} className="text-sm">
              {c.date} — {c.duration} — {c.cost} coins
            </p>
          ))}

          <h3 className="font-semibold mt-4">Gift History</h3>
          {selectedUser.gifts.map((g, i) => (
            <p key={i} className="text-sm">
              {g.date} — {g.gift} — {g.cost} coins
            </p>
          ))}

          <h3 className="font-semibold mt-4">Login Activity</h3>
          {selectedUser.loginActivity.map((l, i) => (
            <p key={i} className="text-sm">{l}</p>
          ))}

          <h3 className="font-semibold mt-4">Device Info</h3>
          <p className="text-sm">{selectedUser.deviceInfo}</p>
        </div>
      )}
    </div>
  );
}
