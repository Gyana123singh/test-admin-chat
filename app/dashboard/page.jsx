"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
    totalUsers: "0",
    totalHosts: "0",
    coinRevenue: "₹0",
    giftsRevenue: "₹0",
    totalCalls: "0",
    pendingVerifications: "0"
  });

  const [charts, setCharts] = useState({
    usersGrowth: { labels: [], data: [] },
    coinUsage: { coinsUsed: 0, coinsPurchased: 1 },
    callsData: [],
    callsLabels: []
  });

  const [tables, setTables] = useState({
    recentJoined: [],
    recentTransactions: []
  });

  const [loading, setLoading] = useState(true);

  // Authentication check and fetch stats
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://api.dilvoicechat.fun";
        
        // Pass token in auth header
        const res = await axios.get(`${apiURL}/api/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.data?.success) {
          setStats(res.data.stats);
          setCharts(res.data.charts);
          setTables(res.data.tables);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Gradient User Growth Line Chart
  const usersChartData = {
    labels: charts.usersGrowth && charts.usersGrowth.labels && charts.usersGrowth.labels.length > 0 ? charts.usersGrowth.labels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New Users",
        data: charts.usersGrowth && charts.usersGrowth.data && charts.usersGrowth.data.length > 0 ? charts.usersGrowth.data : [0, 0, 0, 0, 0, 0, 0],
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
        data: [charts.coinUsage.coinsUsed, charts.coinUsage.coinsPurchased],
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
        data: charts.callsData && charts.callsData.length > 0 ? charts.callsData : [0, 0, 0, 0, 0],
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
    <div className="bg-[#f8f9fc] overflow-y-auto h-screen px-10 pt-10 pb-20">
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">/ Dashboard</p>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
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

      {/* PREMIUM CHARTS */}
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

      {/* TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Table
          title="Recent Joined Members"
          columns={["Name", "Reg Date", "Login Time", "Country"]}
          data={tables.recentJoined.length > 0 ? tables.recentJoined : [
            ["No data", "N/A", "N/A", "N/A"]
          ]}
        />

        <Table
          title="Recent Transactions"
          columns={["User", "Type", "Amount", "Date"]}
          data={tables.recentTransactions.length > 0 ? tables.recentTransactions : [
            ["No transactions", "N/A", "N/A", "N/A"]
          ]}
        />
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

const ChartCard = ({ title, children }) => (
  <div className="bg-white shadow rounded-xl p-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {children}
  </div>
);

function Card({ icon, title, value, percent, color }) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg text-2xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
      <span className="ml-auto px-2 py-1 bg-green-100 text-green-600 rounded-md text-xs font-semibold">
        {percent}
      </span>
    </div>
  );
}

function Table({ title, columns, data }) {
  return (
    <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <table className="w-full text-left min-w-[400px]">
        <thead>
          <tr className="border-b text-gray-500">
            {columns.map((c, i) => (
              <th key={i} className="py-2">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b text-sm">
              {row.map((cell, j) => (
                <td key={j} className="py-3">
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
