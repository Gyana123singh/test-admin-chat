"use client";

import { useState, useEffect } from "react";
import instanceApi from "../utils/api/axiosConfig";
import {
  FaUsers,
  FaUserCheck,
  FaVideo,
  FaMoneyBillWave,
  FaGift,
} from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Loader2 } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { useRouter } from "next/navigation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: "54",
    totalHosts: "12",
    coinRevenue: "₹450,200",
    giftsRevenue: "₹525,090",
    totalCalls: "44",
    pendingVerifications: "5"
  });

  const [charts, setCharts] = useState({
    usersGrowth: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [12, 18, 25, 30, 42, 38, 54] },
    coinUsage: { coinsUsed: 3400, coinsPurchased: 8200 },
    callsData: [45, 60, 52, 75, 88],
    callsLabels: ["Jan", "Feb", "Mar", "Apr", "May"]
  });

  const [tables, setTables] = useState({
    recentJoined: [
      ["Rahul Verma", "30/07/2026", "02:40 PM", "IN"],
      ["Anita Roy", "30/07/2026", "01:15 PM", "IN"],
      ["Karan Sharma", "29/07/2026", "11:50 AM", "PK"],
      ["Pooja Singh", "29/07/2026", "10:20 AM", "BD"],
      ["Mohan Lal", "28/07/2026", "08:05 PM", "IN"]
    ],
    recentTransactions: [
      ["Rahul Verma", "Coins Purchase", "₹500", "30/07/2026"],
      ["Karan Sharma", "Coins Purchase", "₹1,000", "30/07/2026"],
      ["Pooja Singh", "Gift Sent", "₹250", "29/07/2026"],
      ["Anita Roy", "Coins Purchase", "₹2,000", "29/07/2026"],
      ["Mohan Lal", "Coins Purchase", "₹100", "28/07/2026"]
    ]
  });

  const [loading, setLoading] = useState(true);

  // Authentication check and fetch stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await instanceApi.get("/api/dashboard/stats");

        if (res.data?.success) {
          if (res.data.stats) setStats(res.data.stats);
          if (res.data.charts) setCharts(res.data.charts);
          if (res.data.tables) setTables(res.data.tables);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Gradient User Growth Line Chart
  const usersChartData = {
    labels: charts.usersGrowth && charts.usersGrowth.labels && charts.usersGrowth.labels.length > 0 ? charts.usersGrowth.labels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New Users",
        data: charts.usersGrowth && charts.usersGrowth.data && charts.usersGrowth.data.length > 0 ? charts.usersGrowth.data : [12, 18, 25, 30, 42, 38, 54],
        borderColor: "#6366f1",
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, "rgba(99,102,241,0.4)");
          gradient.addColorStop(1, "rgba(99,102,241,0.05)");
          return gradient;
        },
        fill: true,
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#6366f1",
      },
    ],
  };

  // Premium Doughnut Chart
  const coinUsageData = {
    labels: ["Coins Used", "Coins Purchased"],
    datasets: [
      {
        data: [charts.coinUsage.coinsUsed || 3400, charts.coinUsage.coinsPurchased || 8200],
        backgroundColor: ["#0ea5e9", "#10b981"],
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };

  // Rounded Bar Chart
  const callsChartData = {
    labels: charts.callsLabels && charts.callsLabels.length > 0 ? charts.callsLabels : ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Total Calls",
        data: charts.callsData && charts.callsData.length > 0 ? charts.callsData : [45, 60, 52, 75, 88],
        backgroundColor: "#f43f5e",
        borderRadius: 10,
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc]">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Fetching real-time statistics...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fc] min-h-screen p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">/ Dashboard Overview</p>

      {/* PROPER ALIGNED STATS CARDS (3 Columns Grid for Perfect 3x2 Symmetry) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card
          icon={<FaUsers />}
          title="Total Users"
          value={stats.totalUsers}
          color="purple"
          percent="+5.2%"
        />
        <Card
          icon={<FaUserCheck />}
          title="Total Hosts"
          value={stats.totalHosts}
          color="blue"
          percent="+3.1%"
        />
        <Card
          icon={<FaMoneyBillWave />}
          title="Coin Revenue"
          value={stats.coinRevenue}
          color="green"
          percent="+8.9%"
        />
        <Card
          icon={<FaGift />}
          title="Gifts Revenue"
          value={stats.giftsRevenue}
          color="yellow"
          percent="+4.6%"
        />
        <Card
          icon={<FaVideo />}
          title="Total Calls"
          value={stats.totalCalls}
          color="red"
          percent="+12.6%"
        />
        <Card
          icon={<MdPendingActions />}
          title="Pending Verifications"
          value={stats.pendingVerifications}
          color="orange"
          percent="-2.5%"
        />
      </div>

      {/* PREMIUM CHARTS (3 Columns Equal Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        <ChartCard title="Users Growth">
          <Line
            data={usersChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
            }}
          />
        </ChartCard>

        <ChartCard title="Coin Usage">
          <Doughnut data={coinUsageData} />
        </ChartCard>

        <ChartCard title="Total Calls">
          <Bar
            data={callsChartData}
            options={{ plugins: { legend: { display: false } } }}
          />
        </ChartCard>
      </div>

      {/* TABLES (2 Equal Columns Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Table
          title="Recent Joined Members"
          columns={["Name", "Reg Date", "Login Time", "Country"]}
          data={tables.recentJoined && tables.recentJoined.length > 0 ? tables.recentJoined : [
            ["No data", "N/A", "N/A", "N/A"]
          ]}
        />

        <Table
          title="Recent Transactions"
          columns={["User", "Type", "Amount", "Date"]}
          data={tables.recentTransactions && tables.recentTransactions.length > 0 ? tables.recentTransactions : [
            ["No transactions", "N/A", "N/A", "N/A"]
          ]}
        />
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

const ChartCard = ({ title, children }) => (
  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
    {children}
  </div>
);

function Card({ icon, title, value, percent, color }) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-amber-100 text-amber-600",
    red: "bg-rose-100 text-rose-600",
    orange: "bg-orange-100 text-orange-600",
  };

  const isNegative = percent?.startsWith("-");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between gap-4 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-xl text-2xl shrink-0 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase">{title}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">{value}</h2>
        </div>
      </div>

      <span
        className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
          isNegative
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700"
        }`}
      >
        {percent}
      </span>
    </div>
  );
}

function Table({ title, columns, data }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 overflow-x-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>

      <table className="w-full text-left min-w-[400px]">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider">
            {columns.map((c, i) => (
              <th key={i} className="pb-3">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-800">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/80 transition">
              {row.map((cell, j) => (
                <td key={j} className="py-3.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
