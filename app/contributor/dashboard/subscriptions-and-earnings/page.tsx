"use client";

import React from "react";
import {
  Landmark,
  Wallet,
  ChevronDown,
  Monitor,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TRANSACTIONS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    action: "subscribed",
    plan: "Premium Tier - Monthly",
    amount: "+$29.00",
    date: "Today, 10:42 AM",
    type: "subscription",
  },
  {
    id: 2,
    name: "Michael Chen",
    action: "purchased",
    plan: "Advanced UI Design Course",
    amount: "+$149.00",
    date: "Yesterday, 4:15 PM",
    type: "purchase",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    action: "subscribed",
    plan: "Pro Tier - Annual",
    amount: "+$290.00",
    date: "Oct 24, 09:20 AM",
    type: "subscription",
  },
  {
    id: 4,
    name: "David Smith",
    action: "purchased",
    plan: "Figma Mastery Bundle",
    amount: "+$89.00",
    date: "Oct 22, 11:05 AM",
    type: "purchase",
  },
  {
    id: 5,
    name: "Alex Johnson",
    action: "subscribed",
    plan: "Premium Tier - Monthly",
    amount: "+$29.00",
    date: "Oct 21, 02:30 PM",
    type: "subscription",
  },
];



interface AnalyticsChartProps {
  title?: string;
  subtitle?: string;
  data: {
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    sun: number;
  };
}

function AnalyticsChart({
  title = "Earnings Growth",
  subtitle = "Last 7 Days",
  data,
}: AnalyticsChartProps) {
  const chartData = [
    { day: "Mon", value: data.mon },
    { day: "Tue", value: data.tue },
    { day: "Wed", value: data.wed },
    { day: "Thu", value: data.thu },
    { day: "Fri", value: data.fri },
    { day: "Sat", value: data.sat },
    { day: "Sun", value: data.sun },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        <select className="bg-white border border-gray-200 text-gray-600 text-sm font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Chart */}
      <div className="w-full h-56" style={{height: 220}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={true}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={true}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function EarningsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col text-gray-900 pb-20">

      {/* MAIN WRAPPER (THIS FIXES YOUR ISSUE) */}
      <main className="flex-1 w-full">
        
        {/* Constrained container */}
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition mt-1"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Earnings & Subscriptions
                </h2>
                <p className="text-sm text-gray-500">
                  Manage your revenue and track recent transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Landmark size={20} />
              <span className="text-sm font-medium">Available balance</span>
            </div>

            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              NGN 124,500.00
            </h3>

            <p className="text-sm text-gray-400 mt-2 mb-6">
              Total Earnings: NGN 4,200,000.00
            </p>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2">
              <Wallet size={18} />
              Withdraw Funds
            </button>
          </div>

        <AnalyticsChart
  data={{
    mon: 120,
    tue: 210,
    wed: 180,
    thu: 260,
    fri: 300,
    sat: 220,
    sun: 340,
  }}
/>

          {/* Transactions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Recent Transactions</h3>

              <button className="text-blue-600 text-sm font-semibold">
                View All
              </button>
            </div>

            <div className="space-y-6">
              {TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        tx.type === "subscription"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {tx.type === "subscription" ? (
                        <Monitor size={20} />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{tx.name}</span>{" "}
                        {tx.action}
                      </p>
                      <p className="text-xs text-gray-500">{tx.plan}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold">{tx.amount}</p>
                    <p className="text-[10px] text-gray-400">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}