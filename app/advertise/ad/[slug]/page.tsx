"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import {
  editAd, fetchAdById, uploadAdImage, uploadAdVideo,
  fetchAdUniqueUsersCount
} from "@/lib/api/ads";
import { fetchBusinessByUserId } from "@/lib/api/businesses";
import {
  ArrowLeft, Pencil, X, Eye, MousePointer, Users, Calendar,
  CheckCircle, ShieldAlert, Sparkles, Image as ImageIcon, Video,
  AlertTriangle, Play, HelpCircle, Save
} from "lucide-react";

interface Ad {
  id: string;
  name: string;
  smallImages: string[];
  mediumImages: string[];
  largeImages: string[];
  videos: string[];
  views: number;
  clicks: number;
  uniqueUsers?: string[];
  isExpired: boolean;
  endTime: string;
  type: string;
  link?: string;
  user?: string;
  price?: number;
}

const creativeHeaderStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#64748b",
  marginBottom: "1rem",
  marginTop: 0
};

const emptyStateStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#94a3b8",
  fontStyle: "italic",
  margin: 0
};

const sectionDividerStyle: React.CSSProperties = {
  paddingTop: "2rem",
  borderTop: "1px solid #f1f5f9"
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: "1rem"
};

const creativeCardStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "0.75rem",
  overflow: "hidden",
  backgroundColor: "#f8fafc",
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

export default function VendorAdDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [ad, setAd] = useState<Ad | null>(null);
  const [uniqueUsersCount, setUniqueUsersCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const loadData = async () => {
    if (!slug) return;
    try {
      const [adData, countData] = await Promise.all([
        fetchAdById(slug),
        fetchAdUniqueUsersCount(slug).catch(() => ({ count: 0 }))
      ]);

      // Security check: ensure this ad belongs to the logged-in user
      if (adData && adData.user !== user?.$id) {
        alert("Access Denied: You do not own this campaign.");
        router.replace("/advertise/dashboard");
        return;
      }

      setAd(adData);
      setUniqueUsersCount(countData.count);
    } catch (e) {
      console.error("Failed to fetch campaign details:", e);
      alert("Failed to load campaign data");
      router.replace("/advertise/dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace("/signin");
      return;
    }
    loadData();
  }, [slug, user?.$id, userLoading]);

  const handleEndCampaign = async () => {
    if (!ad) return;
    const confirmEnd = window.confirm(
      "Are you sure you want to end this campaign? Once stopped, your ad will no longer be visible to users. This action cannot be undone."
    );
    if (!confirmEnd) return;

    setDeactivating(true);
    try {
      await editAd(ad.id, { isExpired: true });
      setAd({ ...ad, isExpired: true });
      alert("Campaign ended successfully.");
    } catch (err) {
      console.error("Failed to end campaign:", err);
      alert("Failed to stop campaign. Please try again.");
    } finally {
      setDeactivating(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          backgroundColor: "#f8fafc", // slate-50
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "3px solid #e2e8f0", // Subtle gray track
            borderTopColor: "#2563eb",   // Brand blue indicator
            animation: "spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite",
            marginBottom: "1.25rem"
          }}
        />
        <p
          style={{
            fontSize: "0.9375rem", // 15px
            fontWeight: "600",
            color: "#64748b", // slate-500
            margin: 0,
            letterSpacing: "0.01em"
          }}
        >
          Loading campaign metrics...
        </p>

        {/* Required for the spin animation */}
        <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="text-center py-20 bg-slate-50">
        <p className="text-slate-500 font-medium">Campaign not found</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc", // slate-50
        color: "#0f172a", // slate-900
        padding: "2rem 1.5rem",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box"
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* --- NAVIGATION & ACTIONS BAR --- */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/advertise/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#64748b",
              textDecoration: "none",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              transition: "all 0.2s ease",
              marginLeft: "-0.5rem"
            }}
            onPointerEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.color = "#0f172a";
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to Dashboard
          </Link>

          {!ad.isExpired && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  borderRadius: "0.75rem",
                  border: "none",
                  boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)",
                  cursor: "pointer",
                  transition: "transform 0.1s ease"
                }}
                onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
                onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Pencil size={14} strokeWidth={2.5} />
                Edit Ad
              </button>
              <button
                disabled={deactivating}
                onClick={handleEndCampaign}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ffffff",
                  color: "#dc2626", // red-600
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  borderRadius: "0.75rem",
                  border: "1px solid #fecaca", // red-200
                  cursor: deactivating ? "not-allowed" : "pointer",
                  opacity: deactivating ? 0.6 : 1,
                  transition: "background-color 0.2s ease"
                }}
                onPointerEnter={(e) => !deactivating && (e.currentTarget.style.backgroundColor = "#fef2f2")}
                onPointerLeave={(e) => !deactivating && (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                {deactivating ? "Ending..." : "End Campaign"}
              </button>
            </div>
          )}
        </div>

        {/* --- HERO / CAMPAIGN HEADER --- */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "1.5rem",
            border: "1px solid #e2e8f0",
            padding: "2rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.5rem"
          }}
        >
          {/* Subtle accent gradient top */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: "1 1 min-content" }}>
            <span
              style={{
                alignSelf: "flex-start",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                backgroundColor: "#fffbeb", // amber-50
                color: "#b45309", // amber-700
                border: "1px solid #fde68a", // amber-200
                fontSize: "0.7rem",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              {ad.type} Plan
            </span>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.025em", textTransform: "capitalize", lineHeight: 1.2 }}>
              {ad.name}
            </h1>
            {ad.link && (
              <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <span style={{ fontWeight: "600" }}>Destination:</span>
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "250px", // Prevents massive URLs from breaking layout
                    display: "inline-block",
                    verticalAlign: "bottom"
                  }}
                  onPointerEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onPointerLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {ad.link}
                </a>
              </p>
            )}
          </div>

          <div>
            {ad.isExpired ? (
              <span style={{ display: "inline-flex", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                Inactive / Expired
              </span>
            ) : (
              <span style={{ display: "inline-flex", padding: "0.375rem 1rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "700", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
                Active Campaign
              </span>
            )}
          </div>
        </div>

        {/* --- ANALYTICS STATS --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <StatCardUI label="Views" value={ad.views} icon={<Eye size={20} />} color="#2563eb" bg="#eff6ff" />
          <StatCardUI label="Clicks" value={ad.clicks} icon={<MousePointer size={20} />} color="#4f46e5" bg="#eef2ff" />
          <StatCardUI label="Unique Users" value={uniqueUsersCount} icon={<Users size={20} />} color="#7c3aed" bg="#f5f3ff" />
          <StatCardUI label="Duration Ends" value={ad.endTime ? new Date(ad.endTime).toLocaleDateString() : "Pending"} icon={<Calendar size={20} />} color="#d97706" bg="#fffbeb" />
        </div>

        {/* --- CREATIVES PREVIEW DISPLAY --- */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "1.5rem", border: "1px solid #e2e8f0", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: "0 0 2rem 0" }}>Campaign Creatives</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* Small Images (2.5 x 1 Ratio) */}
            <div>
              <h3 style={creativeHeaderStyle}>2.5 x 1 Ratio Images</h3>
              {!ad.smallImages || ad.smallImages.length === 0 ? (
                <p style={emptyStateStyle}>No 2.5x1 creatives configured.</p>
              ) : (
                <div style={gridStyle}>
                  {ad.smallImages.map((url, i) => (
                    <div key={i} style={{ ...creativeCardStyle, aspectRatio: "2.5 / 1" }}>
                      <img src={url} alt={`Small creative ${i + 1}`} style={imageStyle} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medium Images (1.5 x 1 Ratio) */}
            <div style={sectionDividerStyle}>
              <h3 style={creativeHeaderStyle}>1.5 x 1 Ratio Images</h3>
              {!ad.mediumImages || ad.mediumImages.length === 0 ? (
                <p style={emptyStateStyle}>No 1.5x1 creatives configured.</p>
              ) : (
                <div style={gridStyle}>
                  {ad.mediumImages.map((url, i) => (
                    <div key={i} style={{ ...creativeCardStyle, aspectRatio: "1.5 / 1" }}>
                      <img src={url} alt={`Medium creative ${i + 1}`} style={imageStyle} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Banner Images */}
            <div style={sectionDividerStyle}>
              <h3 style={creativeHeaderStyle}>Banner Format Images</h3>
              {!ad.largeImages || ad.largeImages.length === 0 ? (
                <p style={emptyStateStyle}>No banner format creatives configured.</p>
              ) : (
                <div style={gridStyle}>
                  {ad.largeImages.map((url, i) => (
                    <div key={i} style={{ ...creativeCardStyle, height: "100px" }}> {/* Fixed height for banners often works best */}
                      <img src={url} alt={`Banner creative ${i + 1}`} style={imageStyle} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div style={sectionDividerStyle}>
              <h3 style={creativeHeaderStyle}>Video Creatives</h3>
              {!ad.videos || ad.videos.length === 0 ? (
                <p style={emptyStateStyle}>No video creatives configured.</p>
              ) : (
                <div style={{ ...gridStyle, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                  {ad.videos.map((url, i) => (
                    <div key={i} style={{ ...creativeCardStyle, aspectRatio: "16 / 9", backgroundColor: "#000000" }}>
                      <video controls src={url} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Edit campaign details modal */}
      {isEditing && (
        <EditVendorAdModal
          ad={ad}
          onClose={() => setIsEditing(false)}
          onSave={(updated) => setAd(updated)}
        />
      )}
    </div>
  );

  // --- REUSABLE INLINE STYLES ---

  function StatCardUI({
    label,
    value,
    icon,
    color,
    bg
  }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }) {
    return (
      <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "0.75rem", backgroundColor: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>{label}</p>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1.2 }}>{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        </div>
      </div>
    );
  }


}

/* ------------------------------------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-base font-black text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- */

function EditVendorAdModal({
  ad,
  onClose,
  onSave,
}: {
  ad: Ad;
  onClose: () => void;
  onSave: (ad: Ad) => void;
}) {
  const [name, setName] = useState(ad.name);
  const [link, setLink] = useState(ad.link || "");
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const [existingSmall, setExistingSmall] = useState<string[]>(ad.smallImages || []);
  const [existingMedium, setExistingMedium] = useState<string[]>(ad.mediumImages || []);
  const [existingLarge, setExistingLarge] = useState<string[]>(ad.largeImages || []);
  const [existingVideos, setExistingVideos] = useState<string[]>(ad.videos || []);

  const [newSmall, setNewSmall] = useState<File[]>([]);
  const [newMedium, setNewMedium] = useState<File[]>([]);
  const [newLarge, setNewLarge] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!name.trim()) {
      setModalError("Campaign name is required.");
      return;
    }
    if (!link.trim()) {
      setModalError("Ad click link is required.");
      return;
    }
    try {
      new URL(link);
    } catch {
      setModalError("Please enter a valid URL.");
      return;
    }

    setIsSaving(true);
    try {
      const uploadedSmall = await Promise.all(newSmall.map(f => uploadAdImage(f)));
      const uploadedMedium = await Promise.all(newMedium.map(f => uploadAdImage(f)));
      const uploadedLarge = await Promise.all(newLarge.map(f => uploadAdImage(f)));
      const uploadedVideos = await Promise.all(newVideos.map(f => uploadAdVideo(f)));

      const finalSmall = [...existingSmall, ...uploadedSmall];
      const finalMedium = [...existingMedium, ...uploadedMedium];
      const finalLarge = [...existingLarge, ...uploadedLarge];
      const finalVideos = [...existingVideos, ...uploadedVideos];

      if (finalSmall.length + finalMedium.length + finalLarge.length + finalVideos.length === 0) {
        throw new Error("Please retain or upload at least one image or video creative.");
      }

      await editAd(ad.id, {
        name,
        link,
        smallImages: finalSmall,
        mediumImages: finalMedium,
        largeImages: finalLarge,
        videos: finalVideos,
      });

      onSave({
        ...ad,
        name,
        link,
        smallImages: finalSmall,
        mediumImages: finalMedium,
        largeImages: finalLarge,
        videos: finalVideos,
      });

      onClose();
    } catch (err: any) {
      console.error("Failed to edit ad:", err);
      setModalError(err?.message || "Failed to update ad. Please verify assets.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">Edit Campaign Details</h3>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X size={20} />
            </button>
          </div>

          {modalError && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex gap-2">
              <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Campaign Name */}
            <div className="space-y-1">
              <label htmlFor="modal-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ad Campaign Name</label>
              <input
                id="modal-name"
                type="text"
                disabled={isSaving}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900"
              />
            </div>

            {/* Destination URL */}
            <div className="space-y-1">
              <label htmlFor="modal-link" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Destination URL</label>
              <input
                id="modal-link"
                type="text"
                disabled={isSaving}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-900 font-mono"
              />
            </div>

            {/* Plan Display Only */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Type (Read-only)</label>
              <input
                type="text"
                disabled
                value={`${ad.type.toUpperCase()} PLAN - ₦${ad.price ? ad.price.toLocaleString() : "2,500"}`}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-xs font-semibold cursor-not-allowed"
              />
            </div>

            {/* Creatives modification inputs */}

            {/* Small images */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">2.5 x 1 Ratio Images</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {existingSmall.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 border border-slate-200 rounded-lg overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setExistingSmall(existingSmall.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {existingSmall.length + newSmall.length < 3 && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isSaving}
                  onChange={(e) => setNewSmall([...newSmall, ...Array.from(e.target.files || [])].slice(0, 3 - existingSmall.length))}
                  className="text-xs text-slate-500"
                />
              )}
            </div>

            {/* Medium images */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">1.5 x 1 Ratio Images</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {existingMedium.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 border border-slate-200 rounded-lg overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setExistingMedium(existingMedium.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {existingMedium.length + newMedium.length < 3 && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isSaving}
                  onChange={(e) => setNewMedium([...newMedium, ...Array.from(e.target.files || [])].slice(0, 3 - existingMedium.length))}
                  className="text-xs text-slate-500"
                />
              )}
            </div>

            {/* Banner images */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Banner Images</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {existingLarge.map((url, i) => (
                  <div key={i} className="relative w-24 h-12 border border-slate-200 rounded-lg overflow-hidden">
                    <img src={url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setExistingLarge(existingLarge.filter((_, idx) => idx !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {existingLarge.length + newLarge.length < 3 && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isSaving}
                  onChange={(e) => setNewLarge([...newLarge, ...Array.from(e.target.files || [])].slice(0, 3 - existingLarge.length))}
                  className="text-xs text-slate-500"
                />
              )}
            </div>

            {/* Videos */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Videos</label>
              <div className="space-y-2 mb-2">
                {existingVideos.map((url, i) => (
                  <div key={i} className="relative w-32 aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    <video src={url} className="w-full h-full object-contain" />
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => setExistingVideos(existingVideos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              {existingVideos.length + newVideos.length < 2 && (
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  disabled={isSaving}
                  onChange={(e) => setNewVideos([...newVideos, ...Array.from(e.target.files || [])].slice(0, 2 - existingVideos.length))}
                  className="text-xs text-slate-500"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-5 border-t border-slate-100">
              <button
                type="button"
                disabled={isSaving}
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
