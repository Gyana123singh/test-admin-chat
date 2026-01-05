"use client";

import { useState } from "react";
import {
  MessageSquareWarning,
  PhoneCall,
  // Gift,
  ShieldBan,
  Trash2,
  Search,
} from "lucide-react";

export default function ChartReport() {
  const [search, setSearch] = useState("");

  const chatReports = [
    {
      id: 1,
      user: "Rahul",
      reportedBy: "Anita",
      reason: "Abusive message",
      time: "12:40 PM",
    },
    {
      id: 2,
      user: "Karan",
      reportedBy: "Pooja",
      reason: "Spam message",
      time: "11:10 AM",
    },
  ];

  const callReports = [
    {
      id: 3,
      user: "Mohan",
      reportedBy: "Lisha",
      reason: "Harassment on call",
      time: "10:22 AM",
    },
  ];

  // const giftReports = [
  //   {
  //     id: 4,
  //     user: "Sanjay",
  //     reportedBy: "Tina",
  //     reason: "Gift spam",
  //     time: "Yesterday",
  //   },
  // ];

  const ReportCard = ({ icon, title, count }) => (
    <div className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg duration-200">
      <div className="p-4 bg-purple-100 rounded-xl text-purple-700">{icon}</div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-500 text-sm">{count} Reports</p>
      </div>
    </div>
  );

  const ReportTable = ({ title, icon, reports }) => (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {icon} {title}
      </h2>

      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">User</th>
            <th className="p-3">Reported By</th>
            <th className="p-3">Reason</th>
            <th className="p-3">Time</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r) => (
            <tr
              key={r.id}
              className="border-b hover:bg-gray-50 duration-150 cursor-pointer"
            >
              <td className="p-3">{r.user}</td>
              <td className="p-3">{r.reportedBy}</td>
              <td className="p-3">{r.reason}</td>
              <td className="p-3">{r.time}</td>
              <td className="p-3 text-center flex items-center justify-center gap-4">
                {/* Block User */}
                <button className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">
                  <ShieldBan size={18} />
                </button>

                {/* Delete Message */}
                <button className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-8 w-full bg-[#f8f9fc] min-h-screen overflow-y-auto h-screen">
      <h1 className="text-3xl font-bold mb-1">Reports & Moderation</h1>
      <p className="text-gray-500 mb-6">/ Moderation Dashboard</p>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <ReportCard
          title="Chat Reports"
          icon={<MessageSquareWarning size={28} />}
          count={chatReports.length}
        />

        <ReportCard
          title="Call Reports"
          icon={<PhoneCall size={28} />}
          count={callReports.length}
        />

        {/* <ReportCard
          title="Gift Abuse Reports"
          icon={<Gift size={28} />}
          count={giftReports.length}
        /> */}
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2 border px-4 py-2 rounded-xl bg-white shadow-sm">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search reports..."
            className="outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* All Report Tables */}
      <div className="space-y-10">
        <ReportTable
          title="Chat Reports"
          icon={<MessageSquareWarning className="text-purple-600" />}
          reports={chatReports}
        />

        <ReportTable
          title="Call Reports"
          icon={<PhoneCall className="text-purple-600" />}
          reports={callReports}
        />

        {/* <ReportTable
          title="Gift Abuse Reports"
          icon={<Gift className="text-purple-600" />}
          reports={giftReports}
        /> */}
      </div>
    </div>
  );
}
