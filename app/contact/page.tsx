"use client";

import React, { CSSProperties, useState } from "react";
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Send,
  Instagram,
  Twitter,
  Linkedin,
  Clock,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

const BRAND_BLUE = "#2563eb";

const inputStyles: CSSProperties = {
  width: "100%",
  padding: "1rem 1.25rem",
  borderRadius: "1rem",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  color: "#111827",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease"
};

export default function ContactPage() {


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8F9FB",
        display: "flex",
        flexDirection: "column",
        color: "#111827",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box"
      }}
    >
      {/* --- HERO SECTION --- */}
      <section
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f3f4f6",
          padding: "5rem 1.5rem 7rem 1.5rem", // Extra bottom padding for the overlapping cards
          textAlign: "center",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            maxWidth: "1280px", // max-w-7xl
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem"
          }}
        >
          {/* Animated Status Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 1rem",
              borderRadius: "9999px",
              backgroundColor: "#eff6ff",
              color: BRAND_BLUE,
              fontSize: "0.75rem",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
            {/* SVG Pulsing Dot */}
            <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="4" fill={BRAND_BLUE} opacity="0.4">
                <animate attributeName="r" values="4; 6; 4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4; 0; 0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="6" cy="6" r="3" fill={BRAND_BLUE} />
            </svg>
            We're here to help
          </div>

          <h1
            style={{
              fontSize: "clamp(2.25rem, 5vw, 4rem)", // Fluid typography scales smoothly
              fontWeight: "800",
              letterSpacing: "-0.025em",
              margin: 0,
              color: "#111827",
              lineHeight: 1.1
            }}
          >
            Get in touch with us
          </h1>

          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              maxWidth: "42rem",
              margin: "0 auto",
              lineHeight: 1.6
            }}
          >
            Have questions about ED-Library? Whether you're a student or a contributor,
            our team is ready to assist you with anything you need.
          </p>
        </div>
      </section>

      {/* --- CONTACT METHODS (Overlapping Grid) --- */}
      <section
        style={{
          marginTop: "-4rem", // Pulls the grid up over the white hero background
          padding: "0 1.5rem",
          position: "relative",
          zIndex: 10,
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", // Responsive grid
            gap: "1.5rem"
          }}
        >
          {/* Card 1 */}
          <ContactCardUI
            icon={<Phone size={24} color={BRAND_BLUE} />}
            title="Call Us"
            value="+234 701 128 5642"
            desc="Mon - Fri, 9am - 5pm"
            actionText="Call now"
            link="tel:+2348100000000"
          />
          {/* Card 2 */}
          <ContactCardUI
            icon={<MessageCircle size={24} color={BRAND_BLUE} />}
            title="WhatsApp"
            value="+234 906 366 6391"
            desc="Average response: 15 mins"
            actionText="Open WhatsApp"
            link="https://wa.me/2349063666391"
          />
          {/* Card 3 */}
          <ContactCardUI
            icon={<Mail size={24} color={BRAND_BLUE} />}
            title="Email Support"
            value="support@mail.edlibrary.com"
            desc="For detailed inquiries"
            actionText="Send email"
            link="mailto:support@mail.edlibrary.com"
          />
          {/* Card 4 */}
          <ContactCardUI
            icon={<MapPin size={24} color={BRAND_BLUE} />}
            title="Our Office"
            value="Lagos, Nigeria"
            desc="Academic Board HQ"
            actionText="View on map"
            link="https://maps.google.com/?q=Lagos,Nigeria"
          />
        </div>
      </section>

      {/* --- FORM & SOCIALS --- */}
      <section
        style={{
          padding: "5rem 1.5rem",
          boxSizing: "border-box"
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "4rem"
          }}
        >
          {/* Left Column: Info & Socials */}
          <div
            style={{
              flex: "1 1 400px",
              display: "flex",
              flexDirection: "column",
              gap: "3rem"
            }}
          >
            <div>
              <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#111827", margin: "0 0 1rem 0", letterSpacing: "-0.025em" }}>
                Connect with us
              </h2>
              <p style={{ fontSize: "1rem", color: "#6b7280", lineHeight: 1.6, margin: 0, maxWidth: "28rem" }}>
                Follow us on social media for the latest updates on courses,
                new features, and academic resources.
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <SocialLinkUI icon={<Instagram size={20} />} label="Instagram" />
              <SocialLinkUI icon={<Twitter size={20} />} label="Twitter" />
              <SocialLinkUI icon={<Linkedin size={20} />} label="LinkedIn" />
            </div>

            {/* Support Hours Card */}
            <div
              style={{
                backgroundColor: BRAND_BLUE,
                color: "#ffffff",
                borderRadius: "1.5rem",
                padding: "2.5rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.2)"
              }}
            >
              {/* Blur accent */}
              <div
                style={{
                  position: "absolute",
                  top: "-2rem",
                  right: "-2rem",
                  width: "12rem",
                  height: "12rem",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "50%",
                  filter: "blur(40px)"
                }}
              />

              <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Clock color="#bfdbfe" size={32} strokeWidth={2.5} />
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>Support Hours</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", opacity: 0.9, marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Monday - Friday</span>
                    <span style={{ fontWeight: "600" }}>9:00 AM - 6:00 PM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Saturday</span>
                    <span style={{ fontWeight: "600" }}>10:00 AM - 2:00 PM</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                    <span>Sunday</span>
                    <span style={{ fontWeight: "600", fontStyle: "italic" }}>Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          {/* <div
            style={{
              flex: "1 1 500px",
              backgroundColor: "#ffffff",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
              border: "1px solid #f3f4f6",
              boxSizing: "border-box"
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={inputStyles}
                  />
                </div>

              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>Subject</label>
                <input
                  required
                  type="text"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={inputStyles}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ ...inputStyles, resize: "none" }}
                />
              </div>

              <button
                disabled={submitting}
                style={{
                  width: "100%",
                  backgroundColor: submitting ? "#9ca3af" : BRAND_BLUE,
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "1rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                  boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
                  transition: "background-color 0.2s ease"
                }}
              >
                {submitting ? "Sending..." : (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div> */}
        </div>
      </section>

    </div>
  );
}



interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
  actionText: string;
  link: string;
}

const ContactCardUI = ({ icon, title, value, desc, actionText, link }: ContactCardProps) => (
  <div
    style={{
      backgroundColor: "#ffffff",
      borderRadius: "1.5rem",
      padding: "2rem",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
      border: "1px solid #f3f4f6",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      boxSizing: "border-box"
    }}
  >
    <div
      style={{
        width: "3rem",
        height: "3rem",
        borderRadius: "0.75rem",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {icon}
    </div>
    <div>
      <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", margin: "0 0 0.25rem 0" }}>{title}</h3>
      <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "#374151", margin: "0 0 0.25rem 0" }}>{value}</p>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>{desc}</p>
    </div>
    <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
      <a
        href={link}
        target={link.startsWith("http") ? "_blank" : undefined}
        rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
        style={{ textDecoration: "none" }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: BRAND_BLUE,
            fontWeight: "600",
            fontSize: "0.875rem",
            cursor: "pointer",
            padding: 0
          }}
        >
          {actionText} →
        </button>
      </a>
    </div>
  </div>
);

interface SocialLinkProps {
  icon: React.ReactNode;
  label: string;
}

const SocialLinkUI = ({ icon, label }: SocialLinkProps) => (
  <button
    aria-label={label}
    style={{
      width: "3rem",
      height: "3rem",
      borderRadius: "0.75rem",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#4b5563",
      cursor: "pointer",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      transition: "background-color 0.2s ease"
    }}
  >
    {icon}
  </button>
);

function ContactCard({
  icon,
  title,
  value,
  desc,
  link,
  actionText
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
  link: string;
  actionText: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-100 border border-gray-100 group hover:border-blue-200 transition-all duration-500">
      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-lg font-bold text-gray-900 mb-2 truncate">{value}</div>
      <p className="text-sm text-gray-500 mb-6">{desc}</p>
      <Link href={link} className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:gap-2 transition-all">
        {actionText}
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

function SocialLink({ icon, href, label, color }: { icon: React.ReactNode; href: string; label: string; color: string }) {
  return (
    <Link
      href={href}
      title={label}
      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${color}`}
    >
      {icon}
    </Link>
  );
}
