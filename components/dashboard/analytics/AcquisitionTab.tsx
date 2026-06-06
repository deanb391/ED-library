"use client";
// components/dashboard/analytics/AcquisitionTab.tsx
import { useEffect, useState, useCallback } from "react";
import { analyticsApi } from "@/lib/analytics/api";
import type { Timeframe, AcquisitionSummary } from "@/lib/analytics/types/index";
import TimeframeToggle from "./TimeframeToggle";
import MetricCard from "../cards/MetricCard";
import TimeSeriesChart from "../charts/TimeSeriesChart";
import BreakdownPieChart from "../charts/BreakdownPieChart";
import { Users, TrendingUp, Activity } from "lucide-react";

export default function AcquisitionTab() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [data, setData] = useState<AcquisitionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.getAcquisitionSummary(timeframe);
      setData(result);
    } catch (err) {
      console.error("[AcquisitionTab]", err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Acquisition</h2>
          <p className="text-sm text-gray-500 mt-0.5">Signups, active users, and demographic breakdown</p>
        </div>
        <TimeframeToggle value={timeframe} onChange={setTimeframe} />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Total Users"
          value={data?.totalUsers ?? 0}
          loading={loading}
          icon={<Users size={18} />}
        />
        <MetricCard
          label={`Signups (${timeframe})`}
          value={data?.signupsThisPeriod ?? 0}
          loading={loading}
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          label={`Active Users (${timeframe})`}
          value={data?.activeUsersThisPeriod ?? 0}
          loading={loading}
          icon={<Activity size={18} />}
        />
      </div>

      {/* Signups Over Time */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">New Signups Over Time</h3>
        <TimeSeriesChart
          data={data?.signupSeries ?? []}
          type="area"
          series={[{ dataKey: "value", label: "Signups", color: "#3b82f6" }]}
          loading={loading}
        />
      </div>

      {/* Active Users Over Time */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Daily Active Users</h3>
        <TimeSeriesChart
          data={data?.activeUserSeries ?? []}
          type="bar"
          series={[{ dataKey: "value", label: "Active Users", color: "#8b5cf6" }]}
          loading={loading}
        />
      </div>

      {/* Weekly Active Users */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Weekly Active Users</h3>
        <TimeSeriesChart
          data={data?.weeklyActiveUserSeries ?? []}
          type="bar"
          series={[{ dataKey: "value", label: "Weekly Active Users", color: "#10b981" }]}
          loading={loading}
        />
      </div>

      {/* Monthly Active Users */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Monthly Active Users</h3>
        <TimeSeriesChart
          data={data?.monthlyActiveUserSeries ?? []}
          type="bar"
          series={[{ dataKey: "value", label: "Monthly Active Users", color: "#f59e0b" }]}
          loading={loading}
        />
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Signups by Department</h3>
        <BreakdownPieChart data={data?.signupsByDept ?? []} loading={loading} />
      </div>
    </div>
  );
}
