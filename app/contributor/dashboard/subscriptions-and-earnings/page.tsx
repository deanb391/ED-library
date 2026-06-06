"use client";

import React, { useEffect, useState } from "react";
import {
  Landmark,
  Wallet,
  Monitor,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { fetchWallet } from "@/lib/api/wallet";
import { fetchContributorEarnings } from "@/lib/api/earnings";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ===================== CHART PROCESSOR ===================== */

function processEarningsData(
  earnings: any[],
  range: "7d" | "30d" | "1y"
) {
  const now = new Date();

  if (range === "7d") {
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const result: Record<string, number> = {
      Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0,
    };

    earnings.forEach((e) => {
      const date = new Date(e.$createdAt);
      const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (diff <= 7) {
        const day = days[date.getDay()];
        result[day] += e.amount || 0;
      }
    });

    return Object.entries(result).map(([day, value]) => ({ day, value }));
  }

  if (range === "30d") {
    const result: { day: string; value: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);

      const key = d.toLocaleDateString("en-GB", { day: "2-digit" });

      const value = earnings
        .filter((e) => {
          const ed = new Date(e.$createdAt);
          return ed.toDateString() === d.toDateString();
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      result.push({ day: key, value });
    }

    return result;
  }

  if (range === "1y") {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const result = months.map((m) => ({ day: m, value: 0 }));

    earnings.forEach((e) => {
      const date = new Date(e.$createdAt);
      const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      if (diff <= 365) {
        result[date.getMonth()].value += e.amount || 0;
      }
    });

    return result;
  }

  return [];
}

/* ===================== CHART ===================== */

function AnalyticsChart({
  data,
  range,
  setRange,
}: {
  data: any[];
  range: string;
  setRange: (r: "7d" | "30d" | "1y") => void;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Earnings Growth
          </h3>
          <p className="text-sm text-gray-500">
            {range === "7d"
              ? "Last 7 Days"
              : range === "30d"
              ? "Last 30 Days"
              : "This Year"}
          </p>
        </div>

        <select
          value={range}
          onChange={(e) =>
            setRange(e.target.value as "7d" | "30d" | "1y")
          }
          className="bg-white border border-gray-200 text-gray-600 text-sm font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="1y">This Year</option>
        </select>
      </div>

      <div className="w-full h-56" style={{height: 220}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ===================== PAGE ===================== */

export default function EarningsPage() {
  const router = useRouter();
  const { user, contributor } = useUser();

  const [wallet, setWallet] = useState<any>(null);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7d" | "30d" | "1y">("7d");

  useEffect(() => {
    const load = async () => {
      if (!user?.$id) return;
      if (!contributor?.$id) return;

      try {
        setLoading(true);

        const [walletRes, earningsRes] = await Promise.all([
          fetchWallet(user.$id),
          fetchContributorEarnings(contributor.$id),
        ]);
        console.log(earningsRes)

        setWallet(walletRes.wallet);
        setEarnings(earningsRes.earnings || []);
      } catch (err) {
        console.error("Load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.$id]);

  const chartData = processEarningsData(earnings, range);

  const totalEarnings = earnings.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
    <p className="text-gray-700 text-sm">Loading, please wait...</p>
  </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col text-gray-900 pb-20">
      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-start gap-3">
            <button onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </button>

            <div>
              <h2 className="text-2xl font-bold">
                Earnings & Subscriptions
              </h2>
              <p className="text-sm text-gray-500">
                Manage your revenue and track transactions.
              </p>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white rounded-3xl p-6 ">
            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <Landmark size={20} />
              <span className="text-sm">Available balance</span>
            </div>

            <h3 className="text-4xl font-extrabold">
              NGN {wallet?.balance?.toLocaleString() || "0"}
            </h3>

            <p className="text-sm text-gray-400 mt-2 mb-6">
              Total Earnings: NGN {totalEarnings.toLocaleString()}
            </p>

            <button className="w-full bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2" onClick={() => router.push("/contributor/payments/withdraw")}>
              <Wallet size={18} />
              Withdraw Funds
            </button>
          </div>

          {/* Chart */}
          <AnalyticsChart
            data={chartData}
            range={range}
            setRange={setRange}
          />

          {/* Transactions */}
          <div className="bg-white rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">
              Recent Transactions
            </h3>

            <div className="space-y-6">
              {earnings.map((tx) => (
                <div key={tx.$id} className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                      {tx.type === "subscription" ? (
                        <Monitor size={20} />
                      ) : (
                        <GraduationCap size={20} />
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
  <p
    style={{
      fontSize: "14px",
      fontWeight: 600,
      overflowWrap: "break-word",
      wordBreak: "break-word",
    }}
  >
    {tx.description || "Earning"}
  </p>

  <p
    style={{
      fontSize: "12px",
      color: "#6B7280",
      overflowWrap: "break-word",
      wordBreak: "break-word",
    }}
  >
    {tx.courses || "Course purchase"}
  </p>
</div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      +₦{tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.$createdAt).toLocaleDateString()}
                    </p>
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