"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { fetchBusinessByUserId } from "@/lib/api/businesses";
import { Megaphone, Users, Award, ShieldCheck, Zap, ArrowRight } from "lucide-react";

const primaryButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "1rem 2rem",
  backgroundColor: "#2563eb", // blue-600
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "1rem",
  borderRadius: "1rem", // 16px
  textDecoration: "none",
  boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)",
  transition: "transform 0.15s ease",
  cursor: "pointer",
  flex: "1 1 auto",
  minWidth: "200px"
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem 2rem",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "#ffffff",
  fontWeight: "600",
  fontSize: "1rem",
  borderRadius: "1rem",
  textDecoration: "none",
  transition: "background-color 0.2s ease, transform 0.15s ease",
  cursor: "pointer",
  flex: "1 1 auto",
  minWidth: "200px",
  backdropFilter: "blur(4px)"
};

const pricingButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontWeight: "700",
  fontSize: "1rem",
  borderRadius: "1rem",
  textDecoration: "none",
  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)",
  transition: "transform 0.15s ease",
  cursor: "pointer"
};

const featureCardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "2.5rem 2rem",
  borderRadius: "1.5rem",
  border: "1px solid #f1f5f9",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  transition: "transform 0.2s ease",
  cursor: "default"
};

const iconWrapperStyle: React.CSSProperties = {
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1.5rem"
};

export default function AdvertiseLandingPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function checkBusinessProfile() {
      if (userLoading) return;

      if (!user) {
        setCheckingProfile(false);
        return;
      }

      try {
        const profile = await fetchBusinessByUserId(user.$id);
        if (profile) {
          setHasProfile(true);
          router.replace("/advertise/dashboard");
        } else {
          setCheckingProfile(false);
        }
      } catch (err) {
        console.error("Failed to verify business profile:", err);
        setCheckingProfile(false);
      }
    }

    checkBusinessProfile();
  }, [user?.$id, userLoading]);

  if (userLoading || (user && checkingProfile)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          backgroundColor: "#ffffff",
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "3px solid #eff6ff", // Soft blue base track
            borderTopColor: "#2563eb",   // Vibrant brand blue indicator
            animation: "spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite",
            marginBottom: "1.5rem"
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
          Checking advertisement profile...
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
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflowX: "hidden"
      }}
    >
      {/* --- HERO SECTION --- */}
      <section
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #0f172a 0%, #172554 50%, #0f172a 100%)", // Deep premium slate/blue
          color: "#ffffff",
          padding: "6rem 1.5rem 8rem 1.5rem",
          textAlign: "center",
          overflow: "hidden"
        }}
      >
        {/* Subtle decorative background glows */}
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.15) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 10 }}>
          {/* Eyebrow Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 1rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              color: "#60a5fa", // blue-400
              fontSize: "0.75rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "2rem"
            }}
          >
            <Megaphone size={14} />
            ED-Library Advertising
          </div>

          {/* Main Headline with Text Gradient */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)", // Fluid scaling
              fontWeight: "800",
              letterSpacing: "-0.025em",
              lineHeight: "1.1",
              margin: "0 0 1.5rem 0",
              background: "linear-gradient(to right, #ffffff, #e2e8f0, #bfdbfe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          >
            Promote Your Brand to Thousands of Learners
          </h1>

          <p
            style={{
              fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
              color: "#cbd5e1", // slate-300
              maxWidth: "42rem",
              margin: "0 auto",
              fontWeight: "300",
              lineHeight: "1.6"
            }}
          >
            Reach students, researchers, content creators, and academic professionals on ED-Library. Launch your self-serve campaigns in minutes.
          </p>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", alignItems: "center", marginTop: "3rem" }}>
            {user ? (
              <Link
                href="/advertise/onboarding"
                style={primaryButtonStyle}
                onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                href="/signin"
                style={primaryButtonStyle}
                onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span>Sign In to Advertise</span>
                <ArrowRight size={18} />
              </Link>
            )}
            <a
              href="#pricing"
              style={secondaryButtonStyle}
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onPointerEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
              onPointerLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
            >
              View Pricing Plans
            </a>
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section style={{ padding: "5rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.025em", margin: "0 0 1rem 0" }}>
            Why Market With Us?
          </h2>
          <p style={{ fontSize: "1.125rem", color: "#64748b", maxWidth: "36rem", margin: "0 auto", lineHeight: "1.6" }}>
            Get high visibility and drive quality traffic directly to your website, product, or services.
          </p>
        </div>

        {/* Responsive Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>

          {/* Card 1 */}
          <div
            style={featureCardStyle}
            onPointerEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ ...iconWrapperStyle, backgroundColor: "#eff6ff", color: "#2563eb" }}>
              <Users size={28} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.75rem" }}>
              Highly Targeted Audience
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "#64748b", lineHeight: "1.6", margin: 0 }}>
              Connect with university students, academic researchers, and educators who value educational content, products, and services.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={featureCardStyle}
            onPointerEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ ...iconWrapperStyle, backgroundColor: "#eef2ff", color: "#4f46e5" }}>
              <Zap size={28} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.75rem" }}>
              Instant Activation
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "#64748b", lineHeight: "1.6", margin: 0 }}>
              Create your profile, upload your creatives, and complete checkout. Your advertisement goes live on the platform immediately.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={featureCardStyle}
            onPointerEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
            onPointerLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ ...iconWrapperStyle, backgroundColor: "#ecfdf5", color: "#059669" }}>
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.75rem" }}>
              Robust Reporting
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "#64748b", lineHeight: "1.6", margin: 0 }}>
              Track campaign performances through your dashboard. Real-time logging of views, unique reaches, and user clicks.
            </p>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" style={{ padding: "6rem 1.5rem", backgroundColor: "#f1f5f9", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.025em", margin: "0 0 1rem 0" }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: "1.125rem", color: "#64748b", margin: 0 }}>
              No long-term commitments. Pause or stop your campaigns anytime.
            </p>
          </div>

          {/* Pricing Card */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "1.5rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
              maxWidth: "440px",
              margin: "0 auto",
              position: "relative",
              overflow: "hidden"
            }}
          >
            {/* Top Accent Bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", backgroundColor: "#2563eb" }} />

            <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.375rem 1rem",
                  borderRadius: "9999px",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "1rem"
                }}
              >
                Popular Weekly Campaign
              </span>

              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", margin: "0 0 1.5rem 0" }}>
                Weekly Ad Plan
              </h3>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: "800", letterSpacing: "-0.025em", color: "#0f172a", lineHeight: 1 }}>₦2,500</span>
                <span style={{ marginLeft: "0.25rem", fontSize: "1rem", color: "#64748b", fontWeight: "500" }}>/ week</span>
              </div>

              <p style={{ color: "#64748b", fontSize: "0.9375rem", margin: "0 0 2rem 0" }}>
                Ideal for business owners, course creators, and general promoters.
              </p>

              <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "2rem 0" }} />

              {/* Feature List */}
              <ul style={{ listStyle: "none", padding: 0, margin: "0 auto 2.5rem auto", maxWidth: "280px", display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
                {[
                  { text: <>Estimated reach: <strong style={{ color: "#0f172a" }}>2,000+ views</strong></> },
                  { text: "Supports images & video creatives" },
                  { text: "Multiple banner size slots" },
                  { text: "Editable links & creatives" }
                ].map((item, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9375rem", color: "#475569" }}>
                    <Award size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* Call to Action */}
              <div>
                {user ? (
                  <Link
                    href="/advertise/onboarding"
                    style={{ ...pricingButtonStyle, width: "100%" }}
                    onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                    onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    Select Plan & Continue
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    style={{ ...pricingButtonStyle, width: "100%" }}
                    onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                    onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    Sign In to Choose Plan
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // --- REUSABLE INLINE STYLES ---


}


