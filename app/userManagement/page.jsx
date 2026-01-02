"use client";
import { useEffect, useState } from "react";
import { userApi } from "../utils/api/userApi";

export default function UserManagement() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ FETCH USERS
  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await userApi.getAllUser();
        setUserData(res.users || []); // depends on backend response
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  // ✅ FILTER + SEARCH SAFE
  const filtered = userData.filter((u) => {
    const name = u?.username?.toLowerCase() || "";
    const email = u?.email?.toLowerCase() || "";

    return (
      (name.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase())) &&
      (filterCountry ? u.country === filterCountry : true) &&
      (filterGender ? u.gender === filterGender : true) &&
      (filterStatus ? u.status === filterStatus : true)
    );
  });

  // ✅ TOGGLE BAN (LOCAL STATE)
  const toggleBan = (id) => {
    setUserData((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, banned: !u.banned } : u
      )
    );
  };

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6 overflow-y-auto h-screen">
      <h1 className="text-3xl font-bold mb-4">Users Management</h1>

      {/* SEARCH + FILTERS */}
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
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select
          className="border p-2 rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Status</option>
          <option value="Active">Active</option>
          <option value="Verified">Verified</option>
        </select>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
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
              <tr key={u._id} className="border-t hover:bg-gray-50">
                <td className="p-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gray-300 rounded-full" />
                  {u.username}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone || "-"}</td>
                <td className="p-3">{u.country || "-"}</td>
                <td className="p-3">{u.status}</td>

                <td className="p-3 flex gap-2 justify-center">
                  <button
                    className={`px-3 py-1 rounded-md text-white ${
                      u.banned ? "bg-green-500" : "bg-red-500"
                    }`}
                    onClick={() => toggleBan(u._id)}
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

      {/* USER DETAILS PANEL */}
      {selectedUser && (
        <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl p-6 overflow-y-auto">
          <button
            className="text-red-500 mb-4"
            onClick={() => setSelectedUser(null)}
          >
            Close ✕
          </button>

          <h2 className="text-2xl font-bold">{selectedUser.username}</h2>
          <p className="text-gray-600">{selectedUser.email}</p>
        </div>
      )}
    </div>
  );
}
