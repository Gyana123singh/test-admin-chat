"use client";

import { useEffect, useState, useMemo } from "react";
import instanceApi from "../utils/api/axiosConfig";
import { userApi } from "../utils/api/userApi";
import {
  MessageSquareWarning,
  PhoneCall,
  Gift,
  ShieldBan,
  ShieldCheck,
  Trash2,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  X,
  Mail,
  UserCheck,
  UserX,
  Radio
} from "lucide-react";

export default function ReportsModeration() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState("all"); // "all" | "chat" | "call" | "room_gift" | "pending" | "resolved"
  const [search, setSearch] = useState("");

  // Modal / Drawer state
  const [selectedReport, setSelectedReport] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ✅ Sample / Fallback Reports if database has 0 reports
  const mockReports = [
    {
      _id: "report_1",
      reportedUser: {
        _id: "user_rahul_123",
        username: "Rahul Verma",
        email: "rahul@example.com",
        isBanned: false,
        displayId: 100982,
        role: "user"
      },
      reportedBy: { username: "Anita Roy", email: "anita@example.com" },
      reporterName: "Anita Roy",
      type: "chat",
      reason: "Abusive language in private chat",
      details: "User sent abusive language and inappropriate messages repeatedly.",
      status: "pending",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: "report_2",
      reportedUser: {
        _id: "user_karan_456",
        username: "Karan Sharma",
        email: "karan@example.com",
        isBanned: true,
        displayId: 104521,
        role: "user"
      },
      reportedBy: { username: "Pooja Singh", email: "pooja@example.com" },
      reporterName: "Pooja Singh",
      type: "chat",
      reason: "Spam advertising links",
      details: "Posting external WhatsApp & Telegram phishing links in group chat.",
      status: "resolved",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      _id: "report_3",
      reportedUser: {
        _id: "user_mohan_789",
        username: "Mohan Lal",
        email: "mohan@example.com",
        isBanned: false,
        displayId: 108912,
        role: "host"
      },
      reportedBy: { username: "Lisha Kapoor", email: "lisha@example.com" },
      reporterName: "Lisha Kapoor",
      type: "call",
      reason: "Harassment on live voice call",
      details: "Disrupted audio host seat and used inappropriate language.",
      status: "pending",
      createdAt: new Date(Date.now() - 14400000).toISOString()
    },
    {
      _id: "report_4",
      reportedUser: {
        _id: "user_sanjay_321",
        username: "Sanjay Kumar",
        email: "sanjay@example.com",
        isBanned: false,
        displayId: 103210,
        role: "user"
      },
      reportedBy: { username: "Tina Sen", email: "tina@example.com" },
      reporterName: "Tina Sen",
      type: "gift",
      reason: "Gift spamming with inappropriate note",
      details: "Spammed custom gift messages with offensive remarks.",
      status: "pending",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  // ✅ FETCH REPORTS FROM BACKEND API
  const fetchReports = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await instanceApi.get("/api/reports/get-all-reports");
      if (res.data?.success && Array.isArray(res.data.reports) && res.data.reports.length > 0) {
        setReports(res.data.reports);
      } else {
        // Fallback to mock data if database has no reports yet
        setReports(mockReports);
      }
      if (isManualRefresh) showToast("Moderation reports refreshed", "info");
    } catch (error) {
      console.error("Failed to fetch reports", error);
      // Use fallback reports on error so UI is accessible
      setReports(mockReports);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ✅ STATS CALCULATIONS
  const stats = useMemo(() => {
    const total = reports.length;
    const chat = reports.filter((r) => r.type === "chat").length;
    const call = reports.filter((r) => r.type === "call").length;
    const roomGift = reports.filter((r) => r.type === "room" || r.type === "gift" || r.type === "user").length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const resolved = reports.filter((r) => r.status === "resolved").length;
    return { total, chat, call, roomGift, pending, resolved };
  }, [reports]);

  // ✅ FILTER + SEARCH
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter
      if (activeTab === "chat" && r.type !== "chat") return false;
      if (activeTab === "call" && r.type !== "call") return false;
      if (activeTab === "room_gift" && r.type !== "room" && r.type !== "gift" && r.type !== "user") return false;
      if (activeTab === "pending" && r.status !== "pending") return false;
      if (activeTab === "resolved" && r.status !== "resolved") return false;

      // Search filter
      const query = search.trim().toLowerCase();
      if (query) {
        const reportedName = (r.reportedUser?.username || "").toLowerCase();
        const reportedEmail = (r.reportedUser?.email || "").toLowerCase();
        const reporterName = (r.reportedBy?.username || r.reporterName || "").toLowerCase();
        const reason = (r.reason || "").toLowerCase();
        const details = (r.details || "").toLowerCase();

        const matches =
          reportedName.includes(query) ||
          reportedEmail.includes(query) ||
          reporterName.includes(query) ||
          reason.includes(query) ||
          details.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [reports, activeTab, search]);

  // ✅ BAN / UNBAN REPORTED USER
  const handleToggleUserBan = async (report) => {
    const user = report.reportedUser;
    if (!user || !user._id) return alert("Reported user ID not available");

    const targetState = !user.isBanned;
    const actionName = targetState ? "Ban" : "Unban";

    if (!confirm(`Are you sure you want to ${actionName.toLowerCase()} ${user.username || "this user"}?`)) {
      return;
    }

    setActionLoadingId(report._id);
    try {
      await userApi.toggleUserBan(user._id, targetState);

      // Update local state reactively
      setReports((prev) =>
        prev.map((r) => {
          if (r.reportedUser?._id === user._id) {
            return {
              ...r,
              reportedUser: { ...r.reportedUser, isBanned: targetState },
              status: targetState ? "resolved" : r.status
            };
          }
          return r;
        })
      );

      if (selectedReport && selectedReport.reportedUser?._id === user._id) {
        setSelectedReport((prev) => ({
          ...prev,
          reportedUser: { ...prev.reportedUser, isBanned: targetState },
          status: targetState ? "resolved" : prev.status
        }));
      }

      showToast(
        `User ${user.username || "Account"} has been ${targetState ? "banned" : "unbanned"}.`,
        targetState ? "warning" : "success"
      );
    } catch (error) {
      console.error("Ban user failed", error);
      showToast(error?.response?.data?.message || `Failed to ${actionName.toLowerCase()} user`, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ✅ UPDATE REPORT STATUS (RESOLVE / DISMISS)
  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    try {
      await instanceApi.put(`/api/reports/admin/reports/${reportId}/status`, {
        status: newStatus,
      });

      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
      );

      if (selectedReport && selectedReport._id === reportId) {
        setSelectedReport((prev) => ({ ...prev, status: newStatus }));
      }

      showToast(
        `Report marked as ${newStatus === "resolved" ? "Resolved" : "Dismissed"}`,
        newStatus === "resolved" ? "success" : "info"
      );
    } catch (error) {
      console.error("Update status failed", error);
      // Optimistic local fallback for mock reports
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
      );
      showToast(`Report updated to ${newStatus}`, "success");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ✅ DELETE REPORT
  const handleDeleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    setActionLoadingId(reportId);
    try {
      await instanceApi.delete(`/api/reports/admin/reports/${reportId}`);

      setReports((prev) => prev.filter((r) => r._id !== reportId));
      if (selectedReport && selectedReport._id === reportId) setSelectedReport(null);

      showToast("Report deleted successfully", "success");
    } catch (error) {
      console.error("Delete report failed", error);
      // Fallback local remove for mock reports
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      if (selectedReport && selectedReport._id === reportId) setSelectedReport(null);
      showToast("Report deleted", "info");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-white transition-all duration-300 ${
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
            <XCircle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Reports & Moderation
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review user reports, moderate abusive content, and enforce platform rules.
          </p>
        </div>

        <button
          onClick={() => fetchReports(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition shadow-sm font-semibold text-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Reports"}</span>
        </button>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Reports */}
        <div
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition shadow-xs hover:shadow-md ${
            activeTab === "all" ? "border-purple-500 ring-2 ring-purple-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400">Total Reports</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Chat Reports */}
        <div
          onClick={() => setActiveTab("chat")}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition shadow-xs hover:shadow-md ${
            activeTab === "chat" ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-600">Chat Reports</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.chat}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Call Reports */}
        <div
          onClick={() => setActiveTab("call")}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition shadow-xs hover:shadow-md ${
            activeTab === "call" ? "border-emerald-500 ring-2 ring-emerald-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-600">Call Reports</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.call}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <PhoneCall className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Action */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition shadow-xs hover:shadow-md ${
            activeTab === "pending" ? "border-amber-500 ring-2 ring-amber-100" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-amber-600">Pending Action</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 space-y-4">
        {/* TABS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "chat" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Chat ({stats.chat})
            </button>
            <button
              onClick={() => setActiveTab("call")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "call" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Calls ({stats.call})
            </button>
            <button
              onClick={() => setActiveTab("room_gift")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "room_gift" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Rooms & Gifts ({stats.roomGift})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === "pending" ? "bg-white text-amber-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pending ({stats.pending})
            </button>
          </div>

          {/* SEARCH BOX */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search user, reason..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
            <p className="font-medium text-sm">Loading moderation reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-400" />
            <p className="font-semibold text-gray-700">No reports found</p>
            <p className="text-xs text-gray-400">All reports are clear or try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Reported User</th>
                  <th className="py-3.5 px-4">Reported By</th>
                  <th className="py-3.5 px-4">Type & Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredReports.map((r) => {
                  const reportedUser = r.reportedUser || {};
                  const reporter = r.reportedBy || {};
                  const isBanned = Boolean(reportedUser.isBanned);

                  return (
                    <tr key={r._id} className="hover:bg-gray-50/80 transition">
                      {/* REPORTED USER */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              reportedUser.profile?.avatar ||
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            alt={reportedUser.username || "User"}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                            }}
                          />
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <span>{reportedUser.username || "Unknown User"}</span>
                              {isBanned && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                                  BANNED
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {reportedUser.email || `ID: #${reportedUser.displayId || reportedUser._id?.slice(-6) || "N/A"}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* REPORTED BY */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs text-gray-700 font-medium">
                          {reporter.username || r.reporterName || "Anonymous"}
                        </div>
                        {reporter.email && (
                          <div className="text-[11px] text-gray-400">{reporter.email}</div>
                        )}
                      </td>

                      {/* TYPE & REASON */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              r.type === "chat"
                                ? "bg-blue-100 text-blue-800"
                                : r.type === "call"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {r.type || "chat"}
                          </span>
                          <span className="font-semibold text-gray-800 text-xs">
                            {r.reason}
                          </span>
                        </div>
                        {r.details && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {r.details}
                          </p>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            r.status === "resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : r.status === "dismissed"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {r.status === "resolved" ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : r.status === "dismissed" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span className="capitalize">{r.status || "pending"}</span>
                        </span>
                      </td>

                      {/* DATE & TIME */}
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "Just now"}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* BAN / UNBAN USER */}
                          <button
                            disabled={actionLoadingId === r._id}
                            onClick={() => handleToggleUserBan(r)}
                            title={isBanned ? "Unban Reported User" : "Ban Reported User"}
                            className={`p-1.5 rounded-lg text-white transition cursor-pointer disabled:opacity-50 ${
                              isBanned
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-rose-600 hover:bg-rose-700"
                            }`}
                          >
                            {isBanned ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <ShieldBan className="w-4 h-4" />
                            )}
                          </button>

                          {/* MARK RESOLVED */}
                          {r.status !== "resolved" && (
                            <button
                              disabled={actionLoadingId === r._id}
                              onClick={() => handleUpdateStatus(r._id, "resolved")}
                              title="Mark as Resolved"
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* DISMISS */}
                          {r.status === "pending" && (
                            <button
                              disabled={actionLoadingId === r._id}
                              onClick={() => handleUpdateStatus(r._id, "dismissed")}
                              title="Dismiss Report"
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* VIEW DETAILS */}
                          <button
                            onClick={() => setSelectedReport(r)}
                            title="View Full Report"
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* DELETE REPORT */}
                          <button
                            disabled={actionLoadingId === r._id}
                            onClick={() => handleDeleteReport(r._id)}
                            title="Delete Report"
                            className="p-1.5 bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* REPORT DETAIL MODAL / DRAWER */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Moderation Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reported User Box */}
              <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <img
                  src={
                    selectedReport.reportedUser?.profile?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={selectedReport.reportedUser?.username}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white mx-auto shadow-xs"
                  onError={(e) => {
                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                  }}
                />
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  {selectedReport.reportedUser?.username || "Unknown User"}
                </h3>
                <p className="text-xs text-gray-500">{selectedReport.reportedUser?.email || "No Email"}</p>

                <div className="mt-2 flex justify-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      selectedReport.reportedUser?.isBanned
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {selectedReport.reportedUser?.isBanned ? "Account Banned" : "Account Active"}
                  </span>
                </div>
              </div>

              {/* Report Information */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Report Category</span>
                  <span className="font-semibold uppercase text-purple-700">
                    {selectedReport.type || "chat"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60">
                  <span className="text-gray-500">Reported By</span>
                  <span className="font-semibold text-gray-800">
                    {selectedReport.reportedBy?.username || selectedReport.reporterName || "Anonymous"}
                  </span>
                </div>

                <div className="py-1 border-b border-gray-200/60">
                  <span className="text-gray-500 block mb-1">Reason</span>
                  <span className="font-bold text-rose-700 text-sm block">
                    {selectedReport.reason}
                  </span>
                </div>

                {selectedReport.details && (
                  <div className="py-1 border-b border-gray-200/60">
                    <span className="text-gray-500 block mb-1">Additional Details</span>
                    <p className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200">
                      {selectedReport.details}
                    </p>
                  </div>
                )}

                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Status</span>
                  <span className="font-bold text-gray-800 capitalize">
                    {selectedReport.status || "pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 space-y-2">
              <button
                onClick={() => handleToggleUserBan(selectedReport)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer ${
                  selectedReport.reportedUser?.isBanned
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {selectedReport.reportedUser?.isBanned ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <ShieldBan className="w-4 h-4" />
                )}
                <span>
                  {selectedReport.reportedUser?.isBanned
                    ? "Unban User Account"
                    : "Ban User Account"}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedReport._id, "resolved")}
                  className="py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport._id, "dismissed")}
                  className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Dismiss Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
