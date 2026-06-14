"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { fetchBusinessByUserId, updateBusiness } from "@/lib/api/businesses";
import { fetchAds, uploadAdImage } from "@/lib/api/ads";
import {
  Plus, Edit, Eye, MousePointer, Calendar, Megaphone,
  Phone, Globe, Image as ImageIcon, Video, X, Upload, Sparkles, CheckCircle2,
  ArrowRight, AlertCircle
} from "lucide-react";
const metricCardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "1.5rem",
  borderRadius: "1.5rem",
  border: "1px solid #e2e8f0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  display: "flex",
  alignItems: "center",
  gap: "1.25rem"
};

const metricIconWrapperStyle: React.CSSProperties = {
  width: "4rem",
  height: "4rem",
  borderRadius: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
};

const badgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  backgroundColor: "#f8fafc",
  padding: "0.25rem 0.625rem",
  borderRadius: "0.5rem",
  border: "1px solid #f1f5f9",
  fontSize: "0.7rem",
  fontWeight: "600",
  color: "#64748b"
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.5rem"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.875rem 1rem",
  borderRadius: "0.75rem",
  border: "1px solid #cbd5e1",
  fontSize: "0.9375rem",
  color: "#0f172a",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  backgroundColor: "#ffffff"
};


export default function AdvertiseDashboard() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [business, setBusiness] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Edit Business Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFilePreview, setEditFilePreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const loadData = async (userId: string) => {
    try {
      const biz = await fetchBusinessByUserId(userId);
      if (!biz) {
        router.replace("/advertise/onboarding");
        return;
      }
      setBusiness(biz);
      setEditName(biz.name);
      setEditPhone(biz.phone);
      setEditFilePreview(biz.bannerImage);

      const adData = await fetchAds({ filter: { user: userId } });
      setAds(adData.ads || []);
      setDataLoaded(true);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
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
    if (!dataLoaded) {
      loadData(user.$id);
    }
  }, [user?.$id, userLoading, dataLoaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditFile(file);
      setEditFilePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setIsUpdating(true);

    try {
      let bannerImage = business.bannerImage;

      if (editFile) {
        bannerImage = await uploadAdImage(editFile);
      }

      const updatedBiz = await updateBusiness(business.$id, {
        name: editName,
        phone: editPhone,
        bannerImage,
      });

      setBusiness(updatedBiz);
      setIsEditModalOpen(false);
      setEditFile(null);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setUpdateError(err?.message || "Failed to update profile details.");
    } finally {
      setIsUpdating(false);
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
          Loading advertiser dashboard...
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

  // Calculate high-level stats
  const totalViews = ads.reduce((acc, ad) => acc + (ad.views || 0), 0);
  const totalClicks = ads.reduce((acc, ad) => acc + (ad.clicks || 0), 0);
  const activeCampaigns = ads.filter(ad => !ad.isExpired).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc", // Crisp, light slate background
        color: "#0f172a",
        padding: "2rem 1.5rem",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box"
      }}
    >
      <div style={{ maxWidth: "1152px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {/* --- BUSINESS HERO BANNER --- */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "1.5rem",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            position: "relative"
          }}
        >
          {/* Banner Image */}
          <div style={{ height: "200px", width: "100%", position: "relative", backgroundColor: "#f1f5f9" }}>
            {business?.bannerImage ? (
              <img
                src={business.bannerImage}
                alt="Business Banner"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)" }} />
            )}
            {/* Dark gradient overlay to ensure text/avatar pops */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 100%)" }} />
          </div>

          {/* Profile Details (Straddling the banner) */}
          <div
            style={{
              padding: "0 2rem 2rem 2rem",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "-3.5rem", // Pulls content up over the banner
              position: "relative",
              zIndex: 10,
              gap: "1.5rem"
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "1.5rem" }}>
              {/* Avatar */}
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "1.25rem",
                  border: "4px solid #ffffff",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  flexShrink: 0
                }}
              >
                {business?.name?.[0]}
              </div>

              {/* Text Info */}
              <div style={{ paddingBottom: "0.5rem" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.025em" }}>
                  {business?.name}
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Phone size={16} />
                    {business?.phone}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Globe size={16} />
                    Vendor Account
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "#f8fafc",
                color: "#334155",
                fontWeight: "600",
                fontSize: "0.875rem",
                borderRadius: "0.75rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                marginBottom: "0.5rem"
              }}
              onPointerEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
              onPointerLeave={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Edit size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* --- ANALYTICS SUMMARY --- */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>

          {/* Active Campaigns */}
          <div style={metricCardStyle}>
            <div style={{ ...metricIconWrapperStyle, backgroundColor: "#eff6ff", color: "#2563eb" }}>
              <Megaphone size={28} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>Active Campaigns</p>
              <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1 }}>{activeCampaigns}</h3>
            </div>
          </div>

          {/* Total Views */}
          <div style={metricCardStyle}>
            <div style={{ ...metricIconWrapperStyle, backgroundColor: "#eef2ff", color: "#4f46e5" }}>
              <Eye size={28} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>Total Views</p>
              <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1 }}>{totalViews.toLocaleString()}</h3>
            </div>
          </div>

          {/* Total Clicks */}
          <div style={metricCardStyle}>
            <div style={{ ...metricIconWrapperStyle, backgroundColor: "#ecfdf5", color: "#059669" }}>
              <MousePointer size={28} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.25rem 0" }}>Total Clicks</p>
              <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1 }}>{totalClicks.toLocaleString()}</h3>
            </div>
          </div>

        </div>

        {/* --- CAMPAIGNS LIST --- */}
        <div>
          {/* Section Header */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", marginBottom: "1.5rem", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.025em" }}>Your Ad Campaigns</h2>
              <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>Manage and view performance of your active banners.</p>
            </div>
            <Link
              href="/advertise/create"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.25rem",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "0.875rem",
                borderRadius: "0.75rem",
                textDecoration: "none",
                boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
                transition: "transform 0.1s ease"
              }}
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Plus size={16} strokeWidth={2.5} />
              Create Advert
            </Link>
          </div>

          {/* Ad Cards Grid */}
          {ads.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", borderRadius: "1.5rem", border: "1px dashed #cbd5e1", padding: "4rem 2rem", textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
              <div style={{ width: "4rem", height: "4rem", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
                <Megaphone size={32} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", margin: "0 0 0.5rem 0" }}>No campaigns launched yet</h3>
              <p style={{ fontSize: "0.9375rem", color: "#64748b", lineHeight: "1.6", margin: "0 0 2rem 0" }}>
                Launch your first advertisement on ED-Library. Reach over 2,000 active users instantly.
              </p>
              <Link
                href="/advertise/create"
                style={{ display: "inline-flex", padding: "0.75rem 1.5rem", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: "600", borderRadius: "0.75rem", textDecoration: "none", boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)" }}
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {ads.map((ad) => {
                const creativeCount = ad.smallImages.length + ad.mediumImages.length + ad.largeImages.length;
                const videoCount = ad.videos.length;

                return (
                  <div
                    key={ad.id}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "1.25rem",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      overflow: "hidden",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    }}
                    onPointerEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
                    }}
                    onPointerLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                    }}
                  >
                    <div style={{ padding: "1.5rem" }}>

                      {/* Status and title header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.25rem 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <Link href={`/advertise/ad/${ad.id}`} style={{ textDecoration: "none", color: "inherit" }}>{ad.name}</Link>
                          </h3>
                          <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {ad.type} Plan
                          </p>
                        </div>
                        {ad.isExpired ? (
                          <span style={{ display: "inline-flex", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: "700", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                            Expired
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: "700", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", whiteSpace: "nowrap" }}>
                            Active
                          </span>
                        )}
                      </div>

                      {/* Meta info tags */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <span style={badgeStyle}>
                          <ImageIcon size={12} color="#94a3b8" />
                          {creativeCount} Image{creativeCount === 1 ? "" : "s"}
                        </span>
                        {videoCount > 0 && (
                          <span style={badgeStyle}>
                            <Video size={12} color="#94a3b8" />
                            {videoCount} Video{videoCount === 1 ? "" : "s"}
                          </span>
                        )}
                        <span style={badgeStyle}>
                          <Calendar size={12} color="#94a3b8" />
                          Ends: {ad.endTime ? new Date(ad.endTime).toLocaleDateString() : "Pending"}
                        </span>
                      </div>

                      {/* Mini stats */}
                      <div style={{ display: "flex", gap: "1rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "1rem", border: "1px solid #f1f5f9" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.125rem 0" }}>Views</p>
                          <h4 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>{ad.views.toLocaleString()}</h4>
                        </div>
                        <div style={{ width: "1px", backgroundColor: "#e2e8f0" }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.125rem 0" }}>Clicks</p>
                          <h4 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>{ad.clicks.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "700" }}>₦{ad.price ? ad.price.toLocaleString() : "2,500"}</span>
                      <Link
                        href={`/advertise/ad/${ad.id}`}
                        style={{ fontSize: "0.875rem", color: "#2563eb", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
                      >
                        Manage
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT BUSINESS PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "1.5rem", width: "100%", maxWidth: "500px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", border: "1px solid #e2e8f0", position: "relative" }}>

            <div style={{ padding: "2rem" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>Edit Business Details</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ background: "none", border: "none", padding: "0.5rem", borderRadius: "50%", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s" }}
                  onPointerEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                  onPointerLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {updateError && (
                <div style={{ marginBottom: "1.5rem", padding: "0.875rem", borderRadius: "0.75rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.875rem", display: "flex", alignItems: "flex-start", gap: "0.5rem", fontWeight: "500" }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{updateError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Banner Pick */}
                <div>
                  <label style={labelStyle}>Change Business Banner</label>
                  <div style={{ position: "relative", height: "120px", width: "100%", border: "2px dashed #cbd5e1", borderRadius: "1rem", overflow: "hidden", backgroundColor: "#f8fafc", transition: "border-color 0.2s" }} onPointerEnter={(e) => (e.currentTarget.style.borderColor = "#3b82f6")} onPointerLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}>
                    {editFilePreview ? (
                      <div style={{ position: "relative", height: "100%", width: "100%" }}>
                        <img src={editFilePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ backgroundColor: "#ffffff", color: "#0f172a", fontSize: "0.75rem", padding: "0.375rem 0.75rem", borderRadius: "9999px", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <Upload size={14} /> Upload New
                          </span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                      </div>
                    ) : (
                      <label style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", cursor: "pointer", color: "#64748b", alignItems: "center" }}>
                        <Upload size={24} style={{ marginBottom: "0.5rem", color: "#94a3b8" }} />
                        <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#334155" }}>Click to upload banner</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="edit-name" style={labelStyle}>Business Name</label>
                  <input
                    id="edit-name"
                    required
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="edit-phone" style={labelStyle}>Phone Number</label>
                  <input
                    id="edit-phone"
                    required
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    style={{ flex: 1, padding: "0.75rem", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "0.75rem", fontSize: "0.9375rem", fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s" }}
                    onPointerEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onPointerLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    style={{ flex: 1, padding: "0.75rem", backgroundColor: "#2563eb", border: "none", color: "#ffffff", borderRadius: "0.75rem", fontSize: "0.9375rem", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.7 : 1, transition: "background-color 0.2s", boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)" }}
                  >
                    {isUpdating ? (
                      <>
                        <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#ffffff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save Changes
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );

  // --- REUSABLE INLINE STYLES ---


}
