"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { subscribeToPremium } from "@/lib/api/premium";
import { Check, Shield, Download, Zap, X } from "lucide-react";
import AccessWall from "@/components/AccessWall";

export default function PremiumPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  if (user.isPremium) {
    const endDate = user.premiumExpiresAt ? new Date(user.premiumExpiresAt) : new Date();
    // Assuming 30 days subscription duration to calculate start date if not explicitly stored
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => 
      date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upgrade Successful!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            You are now an ED-Library Premium Member.
          </p>
          
          <div className="bg-white dark:bg-black rounded-2xl p-6 mb-8 text-left border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Subscription Details</h3>
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Start Date</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-gray-500 dark:text-gray-400">End Date</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(endDate)}</span>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">Your Privileges:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> Ad-Free Experience</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> Unlimited Offline Downloads</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> Premium Support</li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => router.push("/library")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-xl transition-colors"
          >
            Go to My Library
          </button>
        </div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true);
      const res = await subscribeToPremium(user.$id, user.email);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err) {
      console.error("Upgrade failed:", err);
      setIsProcessing(false);
      alert("Failed to initiate upgrade. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-10 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Take your learning to the next level with offline access and zero interruptions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Features */}
          <div className="space-y-6 bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Why upgrade?</h3>
            
            <div className="flex gap-4">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl shrink-0">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Ad-Free Experience</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Focus entirely on your studies. No more pop-ups or video ads.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl shrink-0">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Offline Downloads</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Download courses and access them without an internet connection, directly in your library.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl shrink-0">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Premium Support</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Get priority assistance from our team whenever you need help.</p>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-black dark:bg-gray-900 p-8 rounded-3xl text-white border border-gray-800 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Shield className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold mb-6">
                Most Popular
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Monthly Plan</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-extrabold">₦400</span>
                <span className="text-gray-400">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Billed monthly</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Cancel anytime</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Secure bank transfer or card</span>
                </li>
              </ul>

              <button
                disabled={isProcessing}
                onClick={handleUpgrade}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Upgrade to Premium"
                )}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Payments are securely processed by Flutterwave.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
