"use client";
// app/analytics/page.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AcquisitionTab from "@/components/dashboard/analytics/AcquisitionTab";
import ContributorsTab from "@/components/dashboard/analytics/ContributorsTab";
import RevenueTab from "@/components/dashboard/analytics/RevenueTab";
import { BarChart2, Users, BookOpen, DollarSign } from "lucide-react";

type Tab = "acquisition" | "contributors" | "revenue";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "acquisition", label: "Acquisition", icon: <Users size={16} /> },
  { id: "contributors", label: "Contributors", icon: <BookOpen size={16} /> },
  { id: "revenue", label: "Revenue", icon: <DollarSign size={16} /> },
];

const VALID_TABS = new Set<Tab>(["acquisition", "contributors", "revenue"]);

export default function AnalyticsDashboardPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const initialTab: Tab = tabParam && VALID_TABS.has(tabParam) ? tabParam : "acquisition";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Sync if the user navigates back/forward with browser buttons
  useEffect(() => {
    if (tabParam && VALID_TABS.has(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <BarChart2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Analytics</h1>
              <p className="text-xs text-gray-400">Business Intelligence Dashboard</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "acquisition" && <AcquisitionTab />}
        {activeTab === "contributors" && <ContributorsTab />}
        {activeTab === "revenue" && <RevenueTab />}
      </div>
    </div>
  );
}
