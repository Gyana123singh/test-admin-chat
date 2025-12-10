"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueAnalytics() {
  const data = [
    { month: "Jan", coins: 4000, gifts: 2400, calls: 3400, payout: 2000 },
    { month: "Feb", coins: 3000, gifts: 1398, calls: 2210, payout: 1800 },
    { month: "Mar", coins: 5000, gifts: 3800, calls: 2900, payout: 2400 },
    { month: "Apr", coins: 4780, gifts: 3908, calls: 3500, payout: 2600 },
    { month: "May", coins: 5890, gifts: 4800, calls: 4200, payout: 3100 },
    { month: "Jun", coins: 6390, gifts: 5300, calls: 4600, payout: 3300 },
  ];

  const countryRevenue = [
    { country: "India", amount: "₹2,40,000" },
    { country: "USA", amount: "₹1,20,000" },
    { country: "UK", amount: "₹80,000" },
    { country: "UAE", amount: "₹65,000" },
    { country: "Australia", amount: "₹40,000" },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br overflow-y-auto h-screen from-gray-50 to-gray-100">
      <h1 className="text-2xl font-bold mb-6">📈 Revenue Analytics</h1>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ---------------- COIN PURCHASE GRAPH ---------------- */}
        <AnalyticsCard title="Coin Purchase Revenue">
          <AnalyticsGraph dataKey="coins" color="#6366f1" data={data} />
        </AnalyticsCard>

        {/* ---------------- GIFT SPENDING GRAPH ---------------- */}
        <AnalyticsCard title="Gift Spending Revenue">
          <AnalyticsGraph dataKey="gifts" color="#10b981" data={data} />
        </AnalyticsCard>

        {/* ---------------- CALL INCOME GRAPH ---------------- */}
        <AnalyticsCard title="Call Income Revenue">
          <AnalyticsGraph dataKey="calls" color="#f59e0b" data={data} />
        </AnalyticsCard>

        {/* ---------------- HOST PAYOUT GRAPH ---------------- */}
        <AnalyticsCard title="Host Payouts">
          <AnalyticsGraph dataKey="payout" color="#ef4444" data={data} />
        </AnalyticsCard>
      </div>

      {/* ---------------- COUNTRY-WISE REVENUE ---------------- */}
      <div className="mt-8">
        <div className="bg-white/70 backdrop-blur-xl border shadow-xl rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">
            🌍 Country-wise Revenue
          </h2>

          <table className="w-full">
            <thead className="bg-gray-100 rounded-lg">
              <tr>
                <th className="p-3 text-left">Country</th>
                <th className="p-3 text-left">Revenue</th>
              </tr>
            </thead>

            <tbody>
              {countryRevenue.map((c, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3">{c.country}</td>
                  <td className="p-3 font-semibold">{c.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               ANALYTICS CARD                               */
/* -------------------------------------------------------------------------- */

function AnalyticsCard({ title, children }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border shadow-xl rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               GRAPH COMPONENT                               */
/* -------------------------------------------------------------------------- */

function AnalyticsGraph({ data, dataKey, color }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={dataKey} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fillOpacity={1}
            fill={`url(#${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
