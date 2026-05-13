"use client";
// components/dashboard/analytics/RevenueTab.tsx
import { useEffect, useState, useCallback } from "react";
import { analyticsApi } from "@/lib/analytics/api";
import type { Timeframe, RevenueSummary } from "@/lib/analytics/types/index";
import TimeframeToggle from "./TimeframeToggle";
import MetricCard from "../cards/MetricCard";
import TimeSeriesChart from "../charts/TimeSeriesChart";
import { DollarSign, TrendingDown, CreditCard, Wallet } from "lucide-react";

export default function RevenueTab() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.getRevenueSummary(timeframe);
      setData(result);
    } catch (err) {
      console.error("[RevenueTab]", err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Revenue & Payments</h2>
          <p className="text-sm text-gray-500 mt-0.5">Wallet topups, subscriptions, withdrawals, and platform earnings</p>
        </div>
        <TimeframeToggle value={timeframe} onChange={setTimeframe} />
      </div>

      {/* Top-level Revenue Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue In" value={fmt(data?.totalIn ?? 0)} loading={loading} icon={<DollarSign size={18} />} />
        <MetricCard label="Total Paid Out" value={fmt(data?.totalOut ?? 0)} loading={loading} icon={<TrendingDown size={18} />} />
        <MetricCard label="Platform Cut" value={fmt(data?.platformCut ?? 0)} loading={loading} icon={<CreditCard size={18} />} />
        <MetricCard label="Withdrawal Charges" value={fmt(data?.withdrawalCharges ?? 0)} loading={loading} icon={<Wallet size={18} />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Deposit Charges" value={fmt(data?.depositCharges ?? 0)} loading={loading} />
        <MetricCard label="Flutterwave Charges" value={fmt(data?.flutterwaveCharges ?? 0)} loading={loading} />
      </div>

      {/* Revenue In vs Out comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Revenue In vs Payouts</h3>
        <TimeSeriesChart
          data={data?.revenueSeries ?? []}
          type="area"
          series={[
            { dataKey: "value", label: "Revenue In", color: "#10b981" },
          ]}
          loading={loading}
          prefix="₦"
        />
      </div>

      {/* Wallet Topups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Wallet Topup Amounts</h3>
          <TimeSeriesChart
            data={data?.walletTopupSeries ?? []}
            type="bar"
            series={[{ dataKey: "value", label: "Topup Amount (₦)", color: "#3b82f6" }]}
            loading={loading}
            prefix="₦"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Subscription Revenue</h3>
          <TimeSeriesChart
            data={data?.subscriptionSeries ?? []}
            type="area"
            series={[{ dataKey: "value", label: "Subscription Revenue (₦)", color: "#8b5cf6" }]}
            loading={loading}
            prefix="₦"
          />
        </div>
      </div>

      {/* Withdrawals */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Withdrawal Volume</h3>
        <TimeSeriesChart
          data={data?.withdrawalSeries ?? []}
          type="line"
          series={[{ dataKey: "value", label: "Withdrawals (₦)", color: "#f97316" }]}
          loading={loading}
          prefix="₦"
        />
      </div>
    </div>
  );
}
