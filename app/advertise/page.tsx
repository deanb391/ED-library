"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { fetchBusinessByUserId } from "@/lib/api/businesses";
import { Megaphone, Users, Award, ShieldCheck, Zap, ArrowRight } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-gray-900 font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-blue-50 dark:border-gray-800 border-t-blue-600 dark:border-t-blue-500 animate-[spin_1s_cubic-bezier(0.55,0.085,0.68,0.53)_infinite] mb-6" />
        <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400 m-0 tracking-[0.01em]">
          Checking advertisement profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-sans overflow-x-hidden transition-colors duration-200">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white pt-24 pb-32 px-6 text-center overflow-hidden">
        {/* Subtle decorative background glows */}
        <div className="absolute -top-[20%] -right-[10%] w-1/2 h-1/2 bg-[radial-gradient(circle,rgba(96,165,250,0.15)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
        <div className="absolute -bottom-[20%] -left-[10%] w-1/2 h-1/2 bg-[radial-gradient(circle,rgba(56,189,248,0.1)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-[0.05em] mb-8">
            <Megaphone size={14} />
            ED-Library Advertising
          </div>

          {/* Main Headline with Text Gradient */}
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-tight leading-[1.1] mb-6 bg-gradient-to-r from-white via-slate-200 to-blue-200 bg-clip-text text-transparent drop-shadow-sm">
            Promote Your Brand to Thousands of Learners
          </h1>

          <p className="text-[clamp(1.125rem,2.5vw,1.25rem)] text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Reach students, researchers, content creators, and academic professionals on ED-Library. Launch your self-serve campaigns in minutes.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center items-center mt-12">
            {user ? (
              <Link
                href="/advertise/onboarding"
                className="flex items-center justify-center gap-2 py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-2xl no-underline shadow-[0_10px_15px_-3px_rgba(37,99,235,0.3)] transition-all duration-150 cursor-pointer flex-auto min-w-[200px] active:scale-95"
              >
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                href="/signin"
                className="flex items-center justify-center gap-2 py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-2xl no-underline shadow-[0_10px_15px_-3px_rgba(37,99,235,0.3)] transition-all duration-150 cursor-pointer flex-auto min-w-[200px] active:scale-95"
              >
                <span>Sign In to Advertise</span>
                <ArrowRight size={18} />
              </Link>
            )}
            <a
              href="#pricing"
              className="flex items-center justify-center py-4 px-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base rounded-2xl no-underline transition-all duration-150 cursor-pointer flex-auto min-w-[200px] backdrop-blur-sm active:scale-95"
            >
              View Pricing Plans
            </a>
          </div>
        </div>
      </section>

      {/* --- BENEFITS SECTION --- */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Why Market With Us?
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Get high visibility and drive quality traffic directly to your website, product, or services.
          </p>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-900 py-10 px-8 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center transition-transform duration-200 cursor-default hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users size={28} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Highly Targeted Audience
            </h3>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed m-0">
              Connect with university students, academic researchers, and educators who value educational content, products, and services.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-900 py-10 px-8 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center transition-transform duration-200 cursor-default hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <Zap size={28} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Instant Activation
            </h3>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed m-0">
              Create your profile, upload your creatives, and complete checkout. Your advertisement goes live on the platform immediately.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-900 py-10 px-8 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center transition-transform duration-200 cursor-default hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Robust Reporting
            </h3>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed m-0">
              Track campaign performances through your dashboard. Real-time logging of views, unique reaches, and user clicks.
            </p>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="py-24 px-6 bg-slate-100 dark:bg-gray-900/50 border-y border-slate-200 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 m-0">
              No long-term commitments. Pause or stop your campaigns anytime.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-slate-200 dark:border-gray-800 shadow-xl dark:shadow-none max-w-md mx-auto relative overflow-hidden transition-colors duration-200">
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

            <div className="p-12 text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.05em] mb-4">
                Popular Weekly Campaign
              </span>

              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
                Weekly Ad Plan
              </h3>

              <div className="flex items-baseline justify-center mb-4">
                <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">₦3,500</span>
                <span className="ml-1 text-base text-slate-500 dark:text-slate-400 font-medium">/ week</span>
              </div>

              <p className="text-[15px] text-slate-500 dark:text-slate-400 mb-8">
                Ideal for business owners, course creators, and general promoters.
              </p>

              <div className="h-px bg-slate-100 dark:bg-gray-800 my-8" />

              {/* Feature List */}
              <ul className="list-none p-0 mx-auto mb-10 max-w-[280px] flex flex-col gap-4 text-left">
                {[
                  { text: <>Estimated reach: <strong className="text-slate-900 dark:text-white">2,000+ views</strong></> },
                  { text: "Supports images & video creatives" },
                  { text: "Multiple banner size slots" },
                  { text: "Editable links & creatives" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[15px] text-slate-600 dark:text-slate-300">
                    <Award size={18} className="text-blue-600 shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              {/* Call to Action */}
              <div>
                {user ? (
                  <Link
                    href="/advertise/onboarding"
                    className="inline-flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl no-underline shadow-md transition-transform duration-150 cursor-pointer w-full active:scale-95"
                  >
                    Select Plan & Continue
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl no-underline shadow-md transition-transform duration-150 cursor-pointer w-full active:scale-95"
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
}
