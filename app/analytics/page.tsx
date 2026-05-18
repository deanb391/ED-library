"use client";
// app/analytics/page.tsx
import { useState, useEffect, Suspense } from "react";
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
const BRAND_BLUE = "#2563eb";

const VALID_TABS = new Set<Tab>(["acquisition", "contributors", "revenue"]);

// Inner component — isolates useSearchParams so it can be Suspense-wrapped
function AnalyticsDashboardContent() {
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F4F7F9",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box"
      }}
    >
      {/* Top Bar (Sticky with glassmorphism) */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid #e5e7eb",
          padding: "1rem 1.5rem",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            maxWidth: "1152px", // max-w-6xl
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap", // Ensures safe wrapping on mobile
            gap: "1rem"
          }}
        >
          {/* Brand / Title Area */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.75rem",
                backgroundColor: BRAND_BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)"
              }}
            >
              <BarChart2 size={20} strokeWidth={2.5} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h1 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
                Analytics
              </h1>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0, fontWeight: "500" }}>
                Business Intelligence Dashboard
              </p>
            </div>
          </div>

          {/* Segmented Tab Navigation */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              backgroundColor: "#f3f4f6",
              padding: "0.25rem",
              borderRadius: "0.75rem",
              overflowX: "auto", // Allows scrolling on very tiny screens
              scrollbarWidth: "none" // Hides scrollbar in Firefox
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    backgroundColor: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "#111827" : "#6b7280",
                    boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)" : "none",
                  }}
                >
                  {/* Optional: Add a slight color tint to the icon when active */}
                  <span style={{ display: "flex", color: isActive ? BRAND_BLUE : "inherit", transition: "color 0.2s" }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1152px", // max-w-6xl
          margin: "0 auto",
          padding: "2rem 1.5rem",
          boxSizing: "border-box"
        }}
      >
        {activeTab === "acquisition" && <AcquisitionTab />}
        {activeTab === "contributors" && <ContributorsTab />}
        {activeTab === "revenue" && <RevenueTab />}
      </div>
    </div>
  );
}

// Shell page — Suspense boundary required by Next.js for useSearchParams
export default function AnalyticsDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7F9]" />}>
      <AnalyticsDashboardContent />
    </Suspense>
  );
}

