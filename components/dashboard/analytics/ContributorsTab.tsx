"use client";
// components/dashboard/analytics/ContributorsTab.tsx
import { useEffect, useState, useCallback } from "react";
import { analyticsApi } from "@/lib/analytics/api";
import type { Timeframe, ContributorSummary } from "@/lib/analytics/types";
import TimeframeToggle from "./TimeframeToggle";
import MetricCard from "../cards/MetricCard";
import TimeSeriesChart from "../charts/TimeSeriesChart";
import { BookOpen, UploadCloud, UserCheck } from "lucide-react";

export default function ContributorsTab() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [data, setData] = useState<ContributorSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await analyticsApi.getContributorSummary(timeframe);
      setData(result);
    } catch (err) {
      console.error("[ContributorsTab]", err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Contributors</h2>
          <p className="text-sm text-gray-500 mt-0.5">Applications, courses, and uploads over time</p>
        </div>
        <TimeframeToggle value={timeframe} onChange={setTimeframe} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Contributors" value={data?.totalContributors ?? 0} loading={loading} icon={<UserCheck size={18} />} />
        <MetricCard label={`Applications (${timeframe})`} value={data?.applicationsThisPeriod ?? 0} loading={loading} />
        <MetricCard label={`Courses Created (${timeframe})`} value={data?.coursesCreatedThisPeriod ?? 0} loading={loading} icon={<BookOpen size={18} />} />
        <MetricCard label={`Uploads (${timeframe})`} value={data?.uploadsThisPeriod ?? 0} loading={loading} icon={<UploadCloud size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Applications Over Time</h3>
          <TimeSeriesChart
            data={data?.applicationSeries ?? []}
            type="area"
            series={[{ dataKey: "value", label: "Applications", color: "#8b5cf6" }]}
            loading={loading}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Courses Created Over Time</h3>
          <TimeSeriesChart
            data={data?.courseCreatedSeries ?? []}
            type="bar"
            series={[{ dataKey: "value", label: "Courses", color: "#10b981" }]}
            loading={loading}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-5">Uploads Per Day</h3>
        <TimeSeriesChart
          data={data?.uploadSeries ?? []}
          type="line"
          series={[{ dataKey: "value", label: "Uploads", color: "#f97316" }]}
          loading={loading}
        />
      </div>
    </div>
  );
}
