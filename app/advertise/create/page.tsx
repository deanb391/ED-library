"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { createVendorAd, uploadAdImage, uploadAdVideo } from "@/lib/api/ads";
import { fetchBusinessByUserId } from "@/lib/api/businesses";
import {
  ArrowLeft, Megaphone, Plus, X, Upload, ImageIcon,
  Video as VideoIcon, Info, HelpCircle, ShieldAlert, Sparkles
} from "lucide-react";

export default function CreateAdCampaignPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [smallImages, setSmallImages] = useState<File[]>([]);
  const [mediumImages, setMediumImages] = useState<File[]>([]);
  const [largeImages, setLargeImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  // Modals & Warnings
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function verifyVendor() {
      if (userLoading) return;
      if (!user) {
        router.replace("/signin");
        return;
      }
      try {
        const profile = await fetchBusinessByUserId(user.$id);
        if (!profile) {
          router.replace("/advertise/onboarding");
        } else {
          setCheckingProfile(false);
        }
      } catch (err) {
        console.error("Failed to verify vendor business profile:", err);
        router.replace("/advertise/onboarding");
      }
    }
    verifyVendor();
  }, [user?.$id, userLoading]);

  // Small images upload handlers
  const handleSmallImageAdd = (files: FileList | null) => {
    if (!files) return;
    const next = [...smallImages, ...Array.from(files)].slice(0, 3);
    setSmallImages(next);
  };
  const removeSmallImage = (index: number) => {
    setSmallImages(smallImages.filter((_, i) => i !== index));
  };

  // Medium images upload handlers
  const handleMediumImageAdd = (files: FileList | null) => {
    if (!files) return;
    const next = [...mediumImages, ...Array.from(files)].slice(0, 3);
    setMediumImages(next);
  };
  const removeMediumImage = (index: number) => {
    setMediumImages(mediumImages.filter((_, i) => i !== index));
  };

  // Large/Banner images upload handlers
  const handleLargeImageAdd = (files: FileList | null) => {
    if (!files) return;
    const next = [...largeImages, ...Array.from(files)].slice(0, 3);
    setLargeImages(next);
  };
  const removeLargeImage = (index: number) => {
    setLargeImages(largeImages.filter((_, i) => i !== index));
  };

  // Videos upload handlers
  const handleVideoAdd = (files: FileList | null) => {
    if (!files) return;
    const next = [...videos, ...Array.from(files)].slice(0, 2);
    setVideos(next);
  };
  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    setFormError("");
    if (!name.trim()) {
      setFormError("Campaign name is required.");
      return false;
    }
    if (!link.trim()) {
      setFormError("Ad click-through destination URL is required.");
      return false;
    }
    try {
      new URL(link);
    } catch {
      setFormError("Please enter a valid URL (e.g. https://example.com).");
      return false;
    }

    const totalCreatives = smallImages.length + mediumImages.length + largeImages.length + videos.length;
    if (totalCreatives === 0) {
      setFormError("Please upload at least one image or video creative.");
      return false;
    }

    return true;
  };

  const handlePublishClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsWarningModalOpen(true);
    }
  };

  const handleProceedToPayment = async () => {
    setIsWarningModalOpen(false);
    setIsUploading(true);
    setFormError("");

    try {
      // 1. Upload small images
      const uploadedSmall: string[] = [];
      for (let i = 0; i < smallImages.length; i++) {
        setUploadProgressMsg(`Uploading small image ${i + 1}/${smallImages.length}...`);
        const url = await uploadAdImage(smallImages[i]);
        uploadedSmall.push(url);
      }

      // 2. Upload medium images
      const uploadedMedium: string[] = [];
      for (let i = 0; i < mediumImages.length; i++) {
        setUploadProgressMsg(`Uploading medium image ${i + 1}/${mediumImages.length}...`);
        const url = await uploadAdImage(mediumImages[i]);
        uploadedMedium.push(url);
      }

      // 3. Upload large/banner images
      const uploadedLarge: string[] = [];
      for (let i = 0; i < largeImages.length; i++) {
        setUploadProgressMsg(`Uploading banner image ${i + 1}/${largeImages.length}...`);
        const url = await uploadAdImage(largeImages[i]);
        uploadedLarge.push(url);
      }

      // 4. Upload videos
      const uploadedVideos: string[] = [];
      for (let i = 0; i < videos.length; i++) {
        setUploadProgressMsg(`Uploading video creative ${i + 1}/${videos.length}...`);
        const url = await uploadAdVideo(videos[i]);
        uploadedVideos.push(url);
      }

      setUploadProgressMsg("Initializing transaction checkout...");

      // 5. Invoke vendor API
      const result = await createVendorAd({
        name,
        smallImages: uploadedSmall,
        mediumImages: uploadedMedium,
        largeImages: uploadedLarge,
        videos: uploadedVideos,
        link,
        user: user!.$id,
        email: user!.email,
      });

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("Checkout URL was not returned by the payment service.");
      }
    } catch (err: any) {
      console.error("Failed to compile campaign:", err);
      setFormError(err?.message || "Failed to set up ad campaign. Please verify files and try again.");
      setIsUploading(false);
    }
  };

  if (userLoading || checkingProfile) {
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
          Verifying advertiser credentials...
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc", // slate-50
        color: "#0f172a", // slate-900
        padding: "3rem 1.5rem",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          maxWidth: "800px", // max-w-3xl
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "1.5rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Style accent top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)" }} />

        <div style={{ padding: "2.5rem" }}>

          {/* Back to dashboard */}
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
              marginBottom: "2rem",
              transition: "color 0.2s ease"
            }}
            onPointerEnter={(e) => (e.currentTarget.style.color = "#0f172a")}
            onPointerLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to Dashboard
          </Link>

          {/* Header Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
            <div style={{ width: "48px", height: "48px", backgroundColor: "#eff6ff", color: "#2563eb", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Megaphone size={24} strokeWidth={2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.25rem 0", letterSpacing: "-0.025em" }}>
                Create Ad Campaign
              </h1>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, fontWeight: "500" }}>
                Design a new campaign and start promoting instantly.
              </p>
            </div>
          </div>

          {formError && (
            <div style={{ marginBottom: "2rem", padding: "1rem", borderRadius: "1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: "0.875rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", fontWeight: "500" }}>
              <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{formError}</span>
            </div>
          )}

          {isUploading && (
            <div style={{ marginBottom: "2rem", padding: "1.5rem", borderRadius: "1rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: "32px", height: "32px", border: "3px solid rgba(37,99,235,0.2)", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "0.75rem" }} />
              <p style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#1e3a8a", margin: "0 0 0.25rem 0" }}>Processing campaign assets...</p>
              <p style={{ fontSize: "0.8125rem", color: "#3b82f6", margin: 0 }}>{uploadProgressMsg}</p>
            </div>
          )}

          <form onSubmit={handlePublishClick} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

            {/* Ad Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="ad-name" style={labelStyle}>
                Campaign Name
              </label>
              <input
                id="ad-name"
                required
                type="text"
                disabled={isUploading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Back to School Promo"
                style={{ ...inputStyle, opacity: isUploading ? 0.6 : 1 }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            {/* Destination Link */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="ad-link" style={labelStyle}>
                Destination URL (Ad Link)
              </label>
              <input
                id="ad-link"
                required
                type="text"
                disabled={isUploading}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. https://www.yourbusiness.com/deal"
                style={{ ...inputStyle, fontFamily: "monospace", opacity: isUploading ? 0.6 : 1 }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.375rem", margin: "0.25rem 0 0 0" }}>
                <Info size={14} />
                Users will be redirected to this link when they click your banner.
              </p>
            </div>

            {/* Pricing Card Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={labelStyle}>
                Selected Billing Plan
              </label>
              <div style={{ backgroundColor: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "0.875rem 1.125rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.25rem 0" }}>Weekly Billing Plan</h4>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Perfect for consistent brand exposure. Estimated reach: <strong style={{ color: "#0f172a" }}>2,000 views</strong>.</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>₦3,500</span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}> / week</span>
                </div>
              </div>
            </div>

            {/* Creatives Upload Grid */}
            <div style={{ paddingTop: "1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "2rem" }}>

              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a", margin: "0 0 0.25rem 0" }}>Campaign Creatives</h3>
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>Upload files for one or more banner sizes to maximize placements.</p>
              </div>

              {/* Small Creatives */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={creativeLabelStyle}>
                    2.5 x 1 Ratio Banners (Max 3)
                  </label>
                  <span style={uploadCountStyle}>{smallImages.length}/3 uploaded</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                  <label style={{ ...uploadButtonStyle, opacity: smallImages.length >= 3 ? 0.5 : 1, cursor: smallImages.length >= 3 ? "not-allowed" : "pointer" }}>
                    <Upload size={16} /> Upload Small Image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading || smallImages.length >= 3}
                      onChange={(e) => handleSmallImageAdd(e.target.files)}
                      style={{ display: "none" }}
                    />
                  </label>

                  {smallImages.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                      {smallImages.map((file, idx) => (
                        <div key={idx} style={{ ...previewBoxStyle, width: "160px", height: "64px" }}> {/* 2.5:1 ratio approx */}
                          <img src={URL.createObjectURL(file)} alt="Preview" style={previewImageStyle} />
                          <button type="button" onClick={() => removeSmallImage(idx)} style={removeBtnStyle}><X size={12} strokeWidth={3} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Medium Creatives */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px dashed #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={creativeLabelStyle}>
                    1.5 x 1 Ratio Banners (Max 3)
                  </label>
                  <span style={uploadCountStyle}>{mediumImages.length}/3 uploaded</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                  <label style={{ ...uploadButtonStyle, opacity: mediumImages.length >= 3 ? 0.5 : 1, cursor: mediumImages.length >= 3 ? "not-allowed" : "pointer" }}>
                    <Upload size={16} /> Upload Medium Image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading || mediumImages.length >= 3}
                      onChange={(e) => handleMediumImageAdd(e.target.files)}
                      style={{ display: "none" }}
                    />
                  </label>

                  {mediumImages.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                      {mediumImages.map((file, idx) => (
                        <div key={idx} style={{ ...previewBoxStyle, width: "120px", height: "80px" }}> {/* 1.5:1 ratio approx */}
                          <img src={URL.createObjectURL(file)} alt="Preview" style={previewImageStyle} />
                          <button type="button" onClick={() => removeMediumImage(idx)} style={removeBtnStyle}><X size={12} strokeWidth={3} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Large/Banner Creatives */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px dashed #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={creativeLabelStyle}>
                    Banner Format Images (Max 3)
                  </label>
                  <span style={uploadCountStyle}>{largeImages.length}/3 uploaded</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                  <label style={{ ...uploadButtonStyle, opacity: largeImages.length >= 3 ? 0.5 : 1, cursor: largeImages.length >= 3 ? "not-allowed" : "pointer" }}>
                    <Upload size={16} /> Upload Banner Image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isUploading || largeImages.length >= 3}
                      onChange={(e) => handleLargeImageAdd(e.target.files)}
                      style={{ display: "none" }}
                    />
                  </label>

                  {largeImages.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                      {largeImages.map((file, idx) => (
                        <div key={idx} style={{ ...previewBoxStyle, width: "100%", maxWidth: "240px", height: "80px" }}>
                          <img src={URL.createObjectURL(file)} alt="Preview" style={previewImageStyle} />
                          <button type="button" onClick={() => removeLargeImage(idx)} style={removeBtnStyle}><X size={12} strokeWidth={3} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Video Creatives */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem", borderTop: "1px dashed #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={creativeLabelStyle}>
                    Video Creatives (Max 2)
                  </label>
                  <span style={uploadCountStyle}>{videos.length}/2 uploaded</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                  <label style={{ ...uploadButtonStyle, opacity: videos.length >= 2 ? 0.5 : 1, cursor: videos.length >= 2 ? "not-allowed" : "pointer" }}>
                    <Upload size={16} /> Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      disabled={isUploading || videos.length >= 2}
                      onChange={(e) => handleVideoAdd(e.target.files)}
                      style={{ display: "none" }}
                    />
                  </label>

                  {videos.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", width: "100%" }}>
                      {videos.map((file, idx) => (
                        <div key={idx} style={{ ...previewBoxStyle, width: "240px", height: "135px", backgroundColor: "#000" }}> {/* 16:9 */}
                          <video src={URL.createObjectURL(file)} muted style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          <button type="button" onClick={() => removeVideo(idx)} style={removeBtnStyle}><X size={12} strokeWidth={3} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Form Actions */}
            <div style={{ paddingTop: "2rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link
                href="/advertise/dashboard"
                style={{ flex: 1, padding: "1rem", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", textAlign: "center", borderRadius: "1rem", fontSize: "0.9375rem", fontWeight: "600", textDecoration: "none", transition: "background-color 0.2s" }}
                onPointerEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onPointerLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isUploading}
                style={{ flex: 1, padding: "1rem", backgroundColor: "#2563eb", border: "none", color: "#ffffff", borderRadius: "1rem", fontSize: "0.9375rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: isUploading ? "not-allowed" : "pointer", opacity: isUploading ? 0.7 : 1, transition: "transform 0.1s ease", boxShadow: "0 4px 6px -1px rgba(37,99,235,0.2)" }}
                onPointerDown={(e) => { if (!isUploading) e.currentTarget.style.transform = "scale(0.98)"; }}
                onPointerUp={(e) => { if (!isUploading) e.currentTarget.style.transform = "scale(1)"; }}
                onPointerLeave={(e) => { if (!isUploading) e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span>Publish and Pay</span>
                <Sparkles size={16} />
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Warning Confirmation Modal */}
      {isWarningModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "1rem", width: "100%", maxWidth: "400px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", overflow: "hidden", border: "1px solid #e2e8f0", padding: "20px" }}>
            
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Payment Information
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You will be redirected to complete your payment.
              If you are paying via bank transfer, the account name may appear as:
            </p>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Blessed Okori (ED-Library)
              </p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              This is the official payment account for ED-Library.
              Please proceed only if the details match.
            </p>

            {/* Processing charge breakdown */}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", marginTop: "1rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", color: "#6b7280", marginBottom: "0.375rem" }}>
                <span>Weekly Ad Plan:</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>₦3,500.00</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", color: "#6b7280", marginBottom: "0.375rem" }}>
                <span>Processing Fee (1.5%):</span>
                <span style={{ fontWeight: "600", color: "#111827" }}>₦52.50</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem", fontWeight: "700", color: "#111827", paddingTop: "0.5rem", borderTop: "1px dashed #e5e7eb" }}>
                <span>Total Amount:</span>
                <span>₦3,552.50</span>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="w-full py-3 rounded-xl text-white font-semibold text-center"
              style={{ backgroundColor: "#2563EB", border: "none", cursor: "pointer" }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // --- REUSABLE INLINE STYLES & HANDLERS ---

}


const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "#334155",
  margin: 0
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 1rem",
  borderRadius: "0.75rem",
  border: "1px solid #cbd5e1",
  fontSize: "0.8125rem",
  color: "#0f172a",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  backgroundColor: "#ffffff"
};

const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#3b82f6";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
};

const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#cbd5e1";
  e.currentTarget.style.boxShadow = "none";
};

const creativeLabelStyle: React.CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#475569",
  margin: 0
};

const uploadCountStyle: React.CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: "600",
  color: "#94a3b8"
};

const uploadButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0 1rem",
  height: "36px",
  backgroundColor: "#f8fafc",
  border: "1px dashed #94a3b8",
  borderRadius: "0.75rem",
  color: "#475569",
  fontSize: "0.75rem",
  fontWeight: "600",
  transition: "border-color 0.2s, color 0.2s"
};

const previewBoxStyle: React.CSSProperties = {
  position: "relative",
  borderRadius: "0.75rem",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
  backgroundColor: "#f1f5f9"
};

const previewImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block"
};

const removeBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: "0.375rem",
  right: "0.375rem",
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: "#ef4444",
  color: "#ffffff",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
};
