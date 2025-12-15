"use client";

import {
  FaUsers,
  FaUserCheck,
  FaVideo,
  FaMoneyBillWave,
  FaGift,
} from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import { Line, Bar, Doughnut } from "react-chartjs-2";

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
import { useEffect } from "react";

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
  /* ---------------- PREMIUM CHART DATA ---------------- */

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
    }
  }, []);


  // for logout functionality
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/Login";
  };
  // Gradient User Growth Line Chart
  const usersChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "New Users",
        data: [20, 50, 40, 80, 60, 100],
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
        data: [3000, 4500],
        backgroundColor: ["#0ea5e9", "#10b981"],
        borderWidth: 3,
        hoverOffset: 15,
      },
    ],
  };

  // Rounded Bar Chart
  const callsChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Total Calls",
        data: [120, 180, 150, 220, 300],
        backgroundColor: "#f43f5e",
        borderRadius: 10,
      },
    ],
  };

  return (
    <div className=" bg-[#f8f9fc] overflow-y-auto h-screen px-10 pt-10">
      <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">/ Dashboard</p>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <Card
          icon={<FaUsers />}
          title="Total Users"
          value="142"
          color="purple"
          percent="+5.2%"
        />
        <Card
          icon={<FaUserCheck />}
          title="Total Hosts"
          value="42"
          color="blue"
          percent="+3.1%"
        />
        <Card
          icon={<FaMoneyBillWave />}
          title="Coin Revenue"
          value="₹56,000"
          color="green"
          percent="+8.9%"
        />
        <Card
          icon={<FaGift />}
          title="Gifts Revenue"
          value="₹12,500"
          color="yellow"
          percent="+4.6%"
        />
        <Card
          icon={<FaVideo />}
          title="Total Calls"
          value="860"
          color="red"
          percent="+12.6%"
        />
        <Card
          icon={<MdPendingActions />}
          title="Pending Verifications"
          value="18"
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
          data={[
            ["Ani Sha", "11/6/2024", "02:51 PM", "India"],
            ["Hari Haran", "11/8/2024", "05:59 PM", "N/A"],
            ["San Deep", "11/12/2024", "11:04 AM", "N/A"],
            ["Vchat One", "11/13/2024", "07:04 AM", "USA"],
          ]}
        />

        <Table
          title="Recent Transactions"
          columns={["User", "Type", "Amount", "Date"]}
          data={[
            ["Vijay", "Coins Purchase", "₹500", "11/10/2024"],
            ["Ramesh", "Gift Sent", "₹300", "11/11/2024"],
            ["Kavi", "Coins Purchase", "₹1200", "11/12/2024"],
            ["Anu", "Gift Received", "₹450", "11/13/2024"],
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
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      <table className="w-full text-left">
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
