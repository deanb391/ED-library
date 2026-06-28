"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fetchContributors, editContributor } from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";
import ContributorReviewModal from "@/components/ContributorReviewModal";
import NoteViewerModal from "@/components/NoteViewerModal";
import SimpleImageViewer from "@/components/SimpleImageViewer";
import { useUser } from "@/context/UserContext";

type Status = "pending" | "live" | "rejected";
type StatusFilter = "all" | Status;
const BRAND_BLUE = "#1C64F2";

export default function ContributorsReviewPage() {
  const { user } = useUser();
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
    const [isViewerOpen, setIsViewerOpen] =useState(false);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
const [viewerIndex, setViewerIndex] = useState(0);
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);

  // 🔥 FETCH FUNCTION (centralized)
  const fetchData = async (reset = false) => {
  if (loading) return;

  setLoading(true);

  try {
    const res = await fetchContributors(
      20,
      filter === "all" ? undefined : filter,
      reset ? undefined : cursor,
      search
    );

    setContributors((prev) =>
      reset ? res.contributors : [...prev, ...res.contributors]
    );

    setCursor(res.nextCursor);
    setHasMore(res.hasMore);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  } finally {
    setLoading(false);
  }
};

  // 🔁 INITIAL + FILTER CHANGE
 useEffect(() => {
  const run = async () => {
    setCursor(undefined);
    setContributors([]); // 🔥 critical
    await fetchData(true);
  };

  run();
}, [filter]);

  // 🔍 SEARCH (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCursor(undefined);
      fetchData(true);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // ➕ LOAD MORE
  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchData(false);
  };

  // ⚠️ COUNTS (honest version)
  const counts: Record<StatusFilter, number> = useMemo(() => {
    return {
      all: contributors.length,
      pending:
        filter === "pending" ? contributors.length : 0,
      live:
        filter === "live" ? contributors.length : 0,
      rejected:
        filter === "rejected" ? contributors.length : 0,
    };
  }, [contributors, filter]);

  // ⚙️ STATUS UPDATE (optimistic)
  const updateStatus = async (id: string, status: Status) => {
    setContributors((prev) =>
      prev.filter((c) => {
        if (c.$id === id) {
          c.status = status;
          return filter === "all" || status === filter;
        }
        return true;
      })
    );

    try {
      await editContributor(id, { status } as any, undefined, user?.$id);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundColor: "#F8F9FB",
    padding: "2rem 1.5rem",
    boxSizing: "border-box",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }}
>
  <div
    style={{
      maxWidth: "1200px", // Much wider max-width for admin dashboards
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "2rem"
    }}
  >
    {/* HEADER */}
    <div>
      <h1
        style={{
          fontSize: "1.875rem",
          fontWeight: "800",
          color: "#111827",
          margin: "0 0 0.5rem 0",
          letterSpacing: "-0.025em"
        }}
      >
        Contributors Review
      </h1>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          margin: 0
        }}
      >
        Review and manage contributor applications
      </p>
    </div>

    {/* CONTROLS (Search & Tabs) */}
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem"
      }}
    >
      {/* SEARCH */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "320px",
          flexGrow: 1
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "0.875rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            display: "flex",
            pointerEvents: "none"
          }}
        >
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search contributors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.625rem 1rem 0.625rem 2.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            color: "#111827",
            outline: "none",
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
            transition: "border-color 0.2s ease"
          }}
        />
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}
      >
        {(["all", "pending", "live", "rejected"] as StatusFilter[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              border: "none",
              backgroundColor: filter === tab ? BRAND_BLUE : "#f3f4f6", // Dark active state like original
              color: filter === tab ? "#ffffff" : "#4b5563",
              transition: "all 0.2s ease-in-out"
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab] || 0})
          </button>
        ))}
      </div>
    </div>

    {/* GRID */}
    {contributors.length === 0 && !loading ? (
      <div
        style={{
          textAlign: "center",
          padding: "5rem 0",
          color: "#6b7280",
          fontSize: "0.875rem",
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          border: "1px dashed #d1d5db"
        }}
      >
        No contributors found
      </div>
    ) : (
      <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Responsive grid magic!
            gap: "1.5rem"
          }}
        >
          {contributors.map((c) => {
            // Helper for semantic badge colors
            const getBadgeStyles = (status: string) => {
              if (status === "live" || status === "approved") return { bg: "#dcfce7", text: "#166534" };
              if (status === "pending") return { bg: "#fef9c3", text: "#854d0e" };
              if (status === "rejected") return { bg: "#fee2e2", text: "#991b1b" };
              return { bg: "#f3f4f6", text: "#374151" };
            };
            const badge = getBadgeStyles(c.status);

            return (
              <div
                key={c.$id}
                onClick={() => setSelectedContributor(c)}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  boxSizing: "border-box"
                }}
              >
                {/* TOP */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <img
                    src={c.profileImage || "https://via.placeholder.com/150"}
                    alt={c.username}
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "50%",
                      objectFit: "cover",
                      backgroundColor: "#f3f4f6",
                      border: "1px solid #f3f4f6"
                    }}
                  />
                  <div>
                    <p style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                      {c.username}
                    </p>
                  </div>
                </div>

                {/* MIDDLE */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      textTransform: "capitalize",
                      backgroundColor: badge.bg,
                      color: badge.text
                    }}
                  >
                    {c.status}
                  </span>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                    Applied: {new Date(c.$createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* ACTIONS */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                  {c.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(c.$id, "live")}
                        style={{
                          flex: 1,
                          padding: "0.625rem",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          backgroundColor: BRAND_BLUE || "#2563eb",
                          color: "#ffffff",
                          borderRadius: "0.5rem",
                          border: "none",
                          cursor: "pointer",
                          transition: "opacity 0.2s"
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(c.$id, "rejected")}
                        style={{
                          flex: 1,
                          padding: "0.625rem",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          backgroundColor: "#ffffff",
                          color: "#374151",
                          borderRadius: "0.5rem",
                          border: "1px solid #d1d5db",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {c.status === "approved" && (
                    <button
                      onClick={() => updateStatus(c.$id, "rejected")}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        backgroundColor: "#ffffff",
                        color: "#dc2626",
                        borderRadius: "0.5rem",
                        border: "1px solid #fca5a5",
                        cursor: "pointer"
                      }}
                    >
                      Revoke
                    </button>
                  )}

                  {c.status === "rejected" && (
                    <button
                      onClick={() => updateStatus(c.$id, "pending")}
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        backgroundColor: "#ffffff",
                        color: "#4b5563",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                        cursor: "pointer"
                      }}
                    >
                      Reconsider
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LOAD MORE */}
        {hasMore && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
            <button
              onClick={loadMore}
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                backgroundColor: "#ffffff",
                color: "#111827",
                border: "1px solid #d1d5db",
                borderRadius: "0.75rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "background-color 0.2s ease"
              }}
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}

        {selectedContributor && (
  <ContributorReviewModal
    contributor={selectedContributor}
    onClose={() => setSelectedContributor(null)}
    onUpdateStatus={updateStatus}
    onPreviewImages={(images, index) => {
    setViewerImages(images);
    setViewerIndex(index);
    setIsViewerOpen(true);
  }}
  />

  
)}


      </>
    )}

    
  </div>
  <SimpleImageViewer
  isOpen={isViewerOpen}
  onClose={() => setIsViewerOpen(false)}
  images={viewerImages}
  initialIndex={viewerIndex}
/>
</div>
  );
}