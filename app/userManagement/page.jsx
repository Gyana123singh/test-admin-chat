"use client";
import { useEffect, useState, useMemo } from "react";
import { userApi } from "../utils/api/userApi";
import { 
  Search, 
  UserCheck, 
  UserX, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  RefreshCw, 
  X,
  Coins,
  Globe,
  Phone,
  Mail,
  Calendar,
  AlertTriangle
} from "lucide-react";

export default function UserManagement() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & State
  const [activeTab, setActiveTab] = useState("all"); // "all" | "active" | "banned"
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterRole, setFilterRole] = useState("");
  
  // Selected user for Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ✅ FETCH USERS FROM API
  const fetchUsers = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await userApi.getAllUser();
      if (res && res.users) {
        setUserData(res.users);
      } else if (Array.isArray(res)) {
        setUserData(res);
      }
      if (isManualRefresh) showToast("User list refreshed successfully", "info");
    } catch (error) {
      console.error("Failed to fetch users", error);
      showToast(error?.response?.data?.message || "Failed to load users from backend", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ STATS CALCULATIONS
  const stats = useMemo(() => {
    const total = userData.length;
    const banned = userData.filter((u) => u.isBanned).length;
    const active = total - banned;
    const hosts = userData.filter((u) => u.role === "host").length;
    return { total, banned, active, hosts };
  }, [userData]);

  // ✅ FILTER + SEARCH
  const filteredUsers = useMemo(() => {
    return userData.filter((u) => {
      const isBanned = Boolean(u.isBanned);
      
      // Tab filter
      if (activeTab === "active" && isBanned) return false;
      if (activeTab === "banned" && !isBanned) return false;

      // Search filter (Username, Email, Phone, Display ID)
      const query = search.trim().toLowerCase();
      if (query) {
        const username = (u.username || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        const displayId = String(u.displayId || u.diiId || "").toLowerCase();

        const matchesQuery =
          username.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          displayId.includes(query);

        if (!matchesQuery) return false;
      }

      // Country filter
      if (filterCountry && u.country !== filterCountry) return false;

      // Gender filter
      if (filterGender && u.gender !== filterGender) return false;

      // Role filter
      if (filterRole && u.role !== filterRole) return false;

      return true;
    });
  }, [userData, activeTab, search, filterCountry, filterGender, filterRole]);

  // ✅ BAN / UNBAN HANDLER
  const handleToggleBan = async (user) => {
    const targetState = !user.isBanned;
    const actionName = targetState ? "Ban" : "Unban";

    if (!confirm(`Are you sure you want to ${actionName.toLowerCase()} ${user.username || "this user"}?`)) {
      return;
    }

    setActionLoadingId(user._id);
    try {
      const res = await userApi.toggleUserBan(user._id, targetState);
      
      if (res && res.success) {
        // Update local state reactively
        setUserData((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, isBanned: targetState } : u
          )
        );

        // Update selected user detail drawer if open
        if (selectedUser && selectedUser._id === user._id) {
          setSelectedUser((prev) => ({ ...prev, isBanned: targetState }));
        }

        showToast(
          res.message || `User ${user.username} has been ${targetState ? "banned" : "unbanned"}.`,
          targetState ? "warning" : "success"
        );
      } else {
        showToast(res.message || `Failed to ${actionName.toLowerCase()} user`, "error");
      }
    } catch (error) {
      console.error("Ban/Unban error:", error);
      showToast(
        error?.response?.data?.message || `Failed to ${actionName.toLowerCase()} user`,
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-600"
              : toast.type === "warning"
              ? "bg-amber-600"
              : toast.type === "error"
              ? "bg-rose-600"
              : "bg-blue-600"
          }`}
        >
          {toast.type === "warning" ? (
            <AlertTriangle className="w-5 h-5" />
          ) : toast.type === "error" ? (
            <UserX className="w-5 h-5" />
          ) : (
            <UserCheck className="w-5 h-5" />
          )}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* HEADER & REFRESH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage users, view banned & unbanned accounts, and control platform access.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition shadow-sm font-medium text-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh List"}</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Users */}
        <div 
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition shadow-xs hover:shadow-md ${
            activeTab === "all" ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Total Accounts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Unbanned Users */}
        <div 
          onClick={() => setActiveTab("active")}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition shadow-xs hover:shadow-md ${
            activeTab === "active" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-600">Active (Unbanned)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Banned Users */}
        <div 
          onClick={() => setActiveTab("banned")}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition shadow-xs hover:shadow-md ${
            activeTab === "banned" ? "border-rose-500 ring-2 ring-rose-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-rose-600">Banned Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.banned}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Hosts */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-purple-600">Hosts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.hosts}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 space-y-4">
        {/* TAB BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "active"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Unbanned Users ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab("banned")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "banned"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Banned Users ({stats.banned})
            </button>
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-800">{filteredUsers.length}</strong> accounts
          </span>
        </div>

        {/* INPUTS & DROPDOWNS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ID..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Country Dropdown */}
          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium bg-white"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            <option value="IN">India (IN)</option>
            <option value="PK">Pakistan (PK)</option>
            <option value="BD">Bangladesh (BD)</option>
          </select>

          {/* Gender Dropdown */}
          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium bg-white"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* Role Dropdown */}
          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-medium bg-white"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="host">Host</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="font-medium text-sm">Fetching users from backend...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-gray-300" />
            <p className="font-semibold text-gray-700">No users found</p>
            <p className="text-xs text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Coins</th>
                  <th className="py-3.5 px-4">Ban Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map((u) => {
                  const isBanned = Boolean(u.isBanned);
                  const isSuperAdmin = u.role === "superadmin";
                  const avatarUrl =
                    u.profile?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-gray-50/80 transition ${
                        isBanned ? "bg-rose-50/30" : ""
                      }`}
                    >
                      {/* USER COLUMN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={u.username || "User Avatar"}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                            }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <span>{u.username || "Anonymous"}</span>
                              {isSuperAdmin && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                  SUPER
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: #{u.displayId || u.diiId || u._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-700 space-y-0.5">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{u.email || "No Email"}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            u.role === "admin" || u.role === "superadmin"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "host"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.role || "user"}
                        </span>
                      </td>

                      {/* COINS */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs">
                          <Coins className="w-3.5 h-3.5" />
                          <span>{(u.coins || 0).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* BAN STATUS BADGE */}
                      <td className="py-3 px-3">
                        {isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap">
                            <ShieldAlert className="w-3 h-3" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            <ShieldCheck className="w-3 h-3" />
                            Active / Unbanned
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* BAN / UNBAN BUTTON */}
                          <button
                            disabled={isSuperAdmin || actionLoadingId === u._id}
                            onClick={() => handleToggleBan(u)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-white transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
                              isBanned
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-rose-600 hover:bg-rose-700"
                            }`}
                          >
                            {actionLoadingId === u._id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : isBanned ? (
                              <UserCheck className="w-3 h-3" />
                            ) : (
                              <UserX className="w-3 h-3" />
                            )}
                            <span>{isBanned ? "Unban User" : "Ban User"}</span>
                          </button>

                          {/* VIEW DETAILS */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USER DETAILS MODAL / DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">User Profile Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="my-6 text-center">
                <img
                  src={
                    selectedUser.profile?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={selectedUser.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 mx-auto shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                  }}
                />
                <h3 className="text-xl font-bold text-gray-900 mt-3">
                  {selectedUser.username}
                </h3>
                <p className="text-xs text-gray-500">
                  Account ID: #{selectedUser.displayId || selectedUser.diiId || selectedUser._id}
                </p>

                <div className="mt-3 flex justify-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      selectedUser.isBanned
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {selectedUser.isBanned ? "Account Banned" : "Account Active"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 capitalize">
                    Role: {selectedUser.role || "user"}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> Email
                  </span>
                  <span className="font-semibold text-gray-800">{selectedUser.email || "N/A"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" /> Phone
                  </span>
                  <span className="font-semibold text-gray-800">{selectedUser.phone || "N/A"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" /> Country
                  </span>
                  <span className="font-semibold text-gray-800">{selectedUser.country || "N/A"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" /> Coins Balance
                  </span>
                  <span className="font-bold text-amber-600">
                    {(selectedUser.coins || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Registered On
                  </span>
                  <span className="font-semibold text-gray-800">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* User Stats if available */}
              {selectedUser.stats && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-blue-600 font-medium">Followers</p>
                    <p className="text-lg font-bold text-blue-900">{selectedUser.stats.followers || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-xs text-purple-600 font-medium">Gifts Received</p>
                    <p className="text-lg font-bold text-purple-900">{selectedUser.stats.giftsReceived || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button
                disabled={selectedUser.role === "superadmin" || actionLoadingId === selectedUser._id}
                onClick={() => handleToggleBan(selectedUser)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  selectedUser.isBanned
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoadingId === selectedUser._id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : selectedUser.isBanned ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <UserX className="w-4 h-4" />
                )}
                <span>
                  {selectedUser.isBanned ? "Unban Account" : "Ban Account"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
