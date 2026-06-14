"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldAlert, BadgeCheck, Scale, AlertCircle } from "lucide-react";

export default function AdvertiserTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header decoration */}
        <div className="h-2 bg-blue-600" />
        
        <div className="p-8 sm:p-12">
          {/* Back button */}
          <Link
            href="/advertise/onboarding"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-8 group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Onboarding
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-2xl">
              <Scale size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Advertising Terms & Conditions
            </h1>
          </div>

          <p className="text-slate-500 text-xs mb-6">
            Last Updated: June 13, 2026. Please read these terms carefully before launching your campaign on ED-Library.
          </p>

          <div className="space-y-6 text-xs sm:text-sm text-slate-700">
            {/* Section 1 */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck size={16} className="text-blue-600" />
                1. Campaign & Content Guidelines
              </h2>
              <p className="leading-relaxed text-slate-600 pl-6 text-xs sm:text-sm">
                All uploaded creatives (images, banners, videos, and links) must be professional, appropriate, and related to education, productivity, business, or utility. We strictly prohibit:
              </p>
              <ul className="list-disc pl-11 space-y-1 text-slate-600 text-xs">
                <li>Misleading or false information.</li>
                <li>Hateful, offensive, adult, or sexually explicit content.</li>
                <li>Intellectual property or copyright infringement.</li>
                <li>Malicious links, viruses, or phishing scams.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck size={16} className="text-blue-600" />
                2. Fees, Billing & Plan Structure
              </h2>
              <p className="leading-relaxed text-slate-600 pl-6 text-xs sm:text-sm">
                The standard Weekly Advertising Plan is priced at <strong>₦3,500 per week</strong>. A 1.5% Flutterwave payment processing fee is added at checkout. Payments are processed in full before the campaign is activated.
              </p>
              <p className="leading-relaxed text-slate-600 pl-6 text-xs sm:text-sm">
                Once a payment is successfully processed and the campaign is activated, the transaction is non-refundable. Plans cannot be changed mid-campaign.
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck size={16} className="text-blue-600" />
                3. Deliveries & Reach Disclaimers
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-slate-800">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-[11px] sm:text-xs leading-relaxed">
                  <strong>Reach Disclaimer:</strong> The estimated reach of 2,000 views per week is based on historical platform activity and is not a strict guarantee of views, clicks, or business outcomes. Actual performance may vary based on market interest and creative quality.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BadgeCheck size={16} className="text-blue-600" />
                4. Rights of Review & Moderation
              </h2>
              <p className="leading-relaxed text-slate-600 pl-6 text-xs sm:text-sm">
                ED-Library administrators reserve the right to review all live ad campaigns. If a campaign is found to violate our terms or receive significant user complaints, it may be deactivated immediately. In cases of violations, no refund will be issued.
              </p>
            </div>

            {/* Section 5 */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert size={16} className="text-blue-600" />
                5. Limitation of Liability
              </h2>
              <p className="leading-relaxed text-slate-600 pl-6 text-xs sm:text-sm">
                ED-Library is provided "as is". We are not responsible for any downtime, temporary loss of visibility, or any business profits/losses resulting from the campaign execution.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <Link
              href="/advertise/onboarding"
              className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition"
            >
              Understand & Continue Onboarding
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
