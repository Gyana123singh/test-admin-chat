"use client";

import { useEffect, useState } from "react";
import instanceApi from "../utils/api/axiosConfig";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, RefreshCw, DollarSign, Gift, PhoneCall, Wallet, Globe } from "lucide-react";

export default function RevenueAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("6_months");

  const [summary, setSummary] = useState({
    totalCoinRevenue: "₹0",
    totalGiftSpending: "0 Coins",
    totalHostPayouts: "₹0",
  });

  const [chartData, setChartData] = useState([
    { month: "Jan", coins: 4000, gifts: 2400, calls: 3400, payout: 2000 },
    { month: "Feb", coins: 3000, gifts: 1398, calls: 2210, payout: 1800 },
    { month: "Mar", coins: 5000, gifts: 3800, calls: 2900, payout: 2400 },
    { month: "Apr", coins: 4780, gifts: 3908, calls: 3500, payout: 2600 },
    { month: "May", coins: 5890, gifts: 4800, calls: 4200, payout: 3100 },
    { month: "Jun", coins: 6390, gifts: 5300, calls: 4600, payout: 3300 },
  ]);

  const [countryRevenue, setCountryRevenue] = useState([
    { country: "India", amount: "₹2,40,000" },
    { country: "Pakistan", amount: "₹1,20,000" },
    { country: "Bangladesh", amount: "₹80,000" },
    { country: "UAE", amount: "₹65,000" },
    { country: "USA", amount: "₹40,000" },
  ]);

  // ✅ FETCH REVENUE ANALYTICS FROM BACKEND API
  const fetchRevenueData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await instanceApi.get(`/api/revenue-analytics?timeframe=${timeframe}`);

      if (res.data?.success) {
        if (res.data.summary) setSummary(res.data.summary);
        if (Array.isArray(res.data.monthlyData) && res.data.monthlyData.length > 0) {
          setChartData(res.data.monthlyData);
        }
        if (Array.isArray(res.data.countryRevenue) && res.data.countryRevenue.length > 0) {
          setCountryRevenue(res.data.countryRevenue);
        }
      }
    } catch (error) {
      console.error("Failed to fetch revenue analytics", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe]);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="text-indigo-600 w-8 h-8" />
            Revenue Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time breakdown of coin sales, gift spending, call revenue, and host payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-sm font-semibold text-gray-700 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="6_months">Last 6 Months</option>
            <option value="this_month">This Month</option>
            <option value="1_year">Last 1 Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchRevenueData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition shadow-xs font-semibold text-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Total Coin Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-indigo-600">Coin Sales Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalCoinRevenue}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Gift Spending */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-600">Gift Volume</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalGiftSpending}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Gift className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Host Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-rose-600">Host Payout Share</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalHostPayouts}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* COIN PURCHASE GRAPH */}
        <AnalyticsCard title="Coin Purchase Revenue (₹)" icon={<DollarSign className="w-5 h-5 text-indigo-600" />}>
          <AnalyticsGraph dataKey="coins" color="#6366f1" data={chartData} />
        </AnalyticsCard>

        {/* GIFT SPENDING GRAPH */}
        <AnalyticsCard title="Gift Spending Volume (Coins)" icon={<Gift className="w-5 h-5 text-emerald-600" />}>
          <AnalyticsGraph dataKey="gifts" color="#10b981" data={chartData} />
        </AnalyticsCard>

        {/* CALL INCOME GRAPH */}
        <AnalyticsCard title="Call & PK Battle Volume" icon={<PhoneCall className="w-5 h-5 text-amber-500" />}>
          <AnalyticsGraph dataKey="calls" color="#f59e0b" data={chartData} />
        </AnalyticsCard>

        {/* HOST PAYOUT GRAPH */}
        <AnalyticsCard title="Host Earnings Payout (₹)" icon={<Wallet className="w-5 h-5 text-rose-500" />}>
          <AnalyticsGraph dataKey="payout" color="#ef4444" data={chartData} />
        </AnalyticsCard>
      </div>

      {/* COUNTRY-WISE REVENUE TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Country-wise Revenue Distribution
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-3.5">Country</th>
                <th className="p-3.5">Total Revenue</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {countryRevenue.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="p-3.5 font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    {c.country}
                  </td>
                  <td className="p-3.5 font-bold text-indigo-700">{c.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ANALYTICS CARD CONTAINER */
function AnalyticsCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-gray-200 shadow-xs rounded-2xl p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </h2>
      {children}
    </div>
  );
}

/* GRAPH COMPONENT */
function AnalyticsGraph({ data, dataKey, color }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#grad-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
