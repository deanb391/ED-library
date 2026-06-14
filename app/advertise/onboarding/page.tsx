"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "@/components/useRouter";
import { useUser } from "@/context/UserContext";
import { createBusiness, fetchBusinessByUserId } from "@/lib/api/businesses";
import { uploadAdImage } from "@/lib/api/ads";
import { Briefcase, Upload, Check, AlertCircle, Sparkles } from "lucide-react";

export default function AdvertiseOnboardingPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    async function checkBusinessProfile() {
      if (userLoading) return;

      if (!user) {
        router.replace("/signin");
        return;
      }

      try {
        const profile = await fetchBusinessByUserId(user.$id);
        if (profile) {
          router.replace("/advertise/dashboard");
        } else {
          setCheckingProfile(false);
        }
      } catch (err) {
        console.error("Failed to fetch business profile:", err);
        setCheckingProfile(false);
      }
    }

    checkBusinessProfile();
  }, [user?.$id, userLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!bannerFile) {
      setError("Please upload a business banner image.");
      return;
    }
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload the banner image
      const uploadedBannerUrl = await uploadAdImage(bannerFile);

      // 2. Create the business profile
      await createBusiness({
        name,
        phone,
        bannerImage: uploadedBannerUrl,
        user: user!.$id,
      });

      // 3. Navigate to the dashboard
      router.push("/advertise/dashboard");
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
      setError(err?.message || "Failed to set up business profile. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          backgroundColor: "#ffffff",
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "3px solid #eff6ff", // Very soft blue base track
            borderTopColor: "#2563eb",   // Vibrant brand blue indicator
            animation: "spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite", // Smoother easing than linear
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
          Checking profile details...
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm  border-slate-100 relative overflow-hidden">
        {/* Design accents */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="p-8 sm:p-10">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase size={26} />
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900">
            Create Business Profile
          </h1>
          <p className="text-sm text-slate-500 text-center mt-1.5 mb-8">
            Tell us about your business to get started placing ads.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50  border-red-200 text-red-700 text-sm flex gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Banner Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Business Banner Image
              </label>

              <div className="relative border-1 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl overflow-hidden transition-all bg-slate-50">
                {bannerPreview ? (
                  <div className="relative h-44 w-full group">
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-white/90 text-slate-900 text-xs px-3 py-1.5 rounded-xl font-medium shadow flex items-center gap-1.5 cursor-pointer">
                        <Upload size={14} /> Change Image
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-10 px-6 cursor-pointer text-slate-500">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400 mb-3">
                      <Upload size={20} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      Upload banner image
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PNG, JPG or WEBP (rec. 800x400 px)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="business-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Business Name
              </label>
              <input
                id="business-name"
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Educational Solutions"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 text-sm placeholder-slate-400"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="business-phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Business Phone Number
              </label>
              <input
                id="business-phone"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 812 345 6789"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-slate-900 text-sm placeholder-slate-400"
              />
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start gap-3 pt-2">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="agree-terms" className="text-xs sm:text-sm text-slate-600 cursor-pointer">
                I agree to the{" "}
                <Link
                  href="/advertise/terms"
                  className="text-blue-600 font-medium hover:underline"
                >
                  terms and conditions
                </Link>{" "}
                governing advertising policies and billing models.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Business Profile</span>
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
