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
    <div className="min-h-screen bg-transparent flex flex-col text-gray-900 dark:text-white font-sans box-border">
      {/* --- HERO SECTION --- */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-center box-border pt-20 pb-28 px-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          {/* Animated Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wide shadow-sm">
            {/* SVG Pulsing Dot */}
            <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="6" r="4" fill="currentColor" opacity="0.4">
                <animate attributeName="r" values="4; 6; 4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4; 0; 0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="6" cy="6" r="3" fill="currentColor" />
            </svg>
            We're here to help
          </div>

          <h1 className="text-[clamp(2.25rem,5vw,4rem)] font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight m-0">
            Get in touch with us
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Have questions about ED-Library? Whether you're a student or a contributor,
            our team is ready to assist you with anything you need.
          </p>
        </div>
      </section>

      {/* --- CONTACT METHODS (Overlapping Grid) --- */}
      <section className="-mt-16 px-6 relative z-10 box-border">
        <div className="max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {/* Card 1 */}
          <ContactCardUI
            icon={<Phone size={24} className="text-blue-600 dark:text-blue-400" />}
            title="Call Us"
            value="+234 701 128 5642"
            desc="Mon - Fri, 9am - 5pm"
            actionText="Call now"
            link="tel:+2348100000000"
          />
          {/* Card 2 */}
          <ContactCardUI
            icon={<MessageCircle size={24} className="text-blue-600 dark:text-blue-400" />}
            title="WhatsApp"
            value="+234 906 366 6391"
            desc="Average response: 15 mins"
            actionText="Open WhatsApp"
            link="https://wa.me/2349063666391"
          />
          {/* Card 3 */}
          <ContactCardUI
            icon={<Mail size={24} className="text-blue-600 dark:text-blue-400" />}
            title="Email Support"
            value="support@mail.edlibrary.com"
            desc="For detailed inquiries"
            actionText="Send email"
            link="mailto:support@mail.edlibrary.com"
          />
        </div>
      </section>

      {/* --- FORM & SOCIALS --- */}
      <section className="py-20 px-6 box-border">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-16">
          {/* Left Column: Info & Socials */}
          <div className="flex-1 min-w-[300px] flex flex-col gap-12">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                Connect with us
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed m-0 max-w-md">
                Follow us on social media for the latest updates on courses,
                new features, and academic resources.
              </p>
            </div>

            <div className="flex gap-4">
              <SocialLinkUI icon={<Instagram size={20} />} label="Instagram" />
              <SocialLinkUI icon={<Twitter size={20} />} label="Twitter" />
              <SocialLinkUI icon={<Linkedin size={20} />} label="LinkedIn" />
            </div>
          </div>
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
  <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-lg shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col gap-4 box-border transition-colors duration-200">
    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 m-0">{desc}</p>
    </div>
    <div className="mt-auto pt-2">
      <a
        href={link}
        target={link.startsWith("http") ? "_blank" : undefined}
        rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
        className="no-underline"
      >
        <button className="bg-transparent border-none text-blue-600 dark:text-blue-400 font-semibold text-sm cursor-pointer p-0 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
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
    className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-800"
  >
    {icon}
  </button>
);
