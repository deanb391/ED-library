"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Scale, ShieldAlert } from "lucide-react";

export default function ContributorTermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header decoration */}
        <div className="h-2 bg-blue-600" />
        
        <div className="p-8 sm:p-12">
          {/* Back button */}
          <Link
            href="/onboarding/step-1"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition mb-8 group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Application
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 text-blue-600 p-2.5 rounded-2xl">
              <Scale size={24} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Contributor Terms & Conditions
            </h1>
          </div>

          <p className="text-slate-500 text-xs mb-8">
            Last Updated: December 5, 2026. Please read these terms carefully before joining as an ED-Library Contributor.
          </p>

          <div className="space-y-8 text-xs sm:text-sm text-slate-700 max-h-[60vh] overflow-y-auto pr-2">
            <p className="font-bold text-sm">ED-LIBRARY CONTRIBUTOR TERMS AND CONDITIONS</p>
            <p>Effective Date: 12/05/2026</p>
            <p>These Contributor Terms and Conditions (“Terms”) govern the relationship between ED-Library (“ED-Library,” “we,” “our,” or “us”) and any individual or entity (“Contributor,” “you,” or “your”) who uploads, publishes, distributes, sells, or otherwise provides content through the ED-Library platform, including its website, mobile applications, APIs, affiliated services, future applications, and related technologies.</p>
            <p>By registering as a Contributor, uploading content, or using contributor features on ED-Library, you agree to be legally bound by these Terms.</p>
            
            <hr className="my-4 border-gray-200 dark:border-gray-800" />
            
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">1. DEFINITIONS</h3>
              <p>For the purpose of these Terms:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>“Platform” refers to ED-Library websites, applications, software, systems, APIs, databases, and services.</li>
                <li>“Content” refers to notes, textbooks, summaries, slides, documents, PDFs, images, questions, answers, academic resources, metadata, thumbnails, previews, descriptions, tags, and any uploaded material.</li>
                <li>“Contributor” refers to any user who uploads or distributes content through ED-Library.</li>
                <li>“Revenue” refers to earnings generated from eligible content through purchases, subscriptions, monetization systems, or future monetization features approved by ED-Library.</li>
              </ul>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">2. ELIGIBILITY</h3>
              <p>To become a Contributor, you must:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Be at least 18 years old; or</li>
                <li>Have permission and supervision from a parent or legal guardian where required by applicable law.</li>
              </ul>
              <p>By using ED-Library as a Contributor, you represent that:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>You are legally capable of entering binding agreements;</li>
                <li>The information you provide is accurate and complete;</li>
                <li>You are not prohibited from using the Platform under any applicable law.</li>
              </ul>
              <p>ED-Library reserves the right to refuse, restrict, suspend, or terminate contributor access at its sole discretion.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">3. CONTRIBUTOR CONTENT OWNERSHIP</h3>
              <p>Contributors retain ownership of the original intellectual property rights to content they upload to ED-Library.</p>
              <p>However, by uploading content to ED-Library, you grant ED-Library a perpetual, worldwide, non-exclusive, royalty-free, transferable, sublicensable, irrevocable license to host, store, reproduce, cache, format, convert, adapt, publish, display, distribute, promote, analyze, index, archive, and use the content across current and future ED-Library platforms and affiliated services.</p>
              <p>This license survives account termination, content deletion, or discontinuation of services to the extent necessary for archived records, backups, legal compliance, and recommendation/AI training systems already developed.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">4. CONTENT WARRANTIES</h3>
              <p>By uploading content, you represent and warrant that you own the content or possess all necessary rights, permissions, and authority. You warrant that your content does not infringe copyrights, trademarks, violate academic integrity, privacy rights, confidentiality obligations, or intellectual property laws.</p>
              <p>You are solely responsible for all uploaded content. ED-Library assumes no responsibility for contributor content.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">5. PROHIBITED CONTENT</h3>
              <p>Contributors may not upload, distribute, sell, or promote leaked examinations, confidential institutional materials, unauthorized lecturer materials, pirated textbooks, malware, fraudulent materials, spam, hate speech, harassment, pornographic content, or content designed to facilitate cheating.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">6. ACADEMIC INTEGRITY</h3>
              <p>ED-Library is intended to support lawful educational collaboration. Contributors may not use the Platform to sell answers to active examinations, circumvent institutional assessment systems, facilitate academic dishonesty, or violate university policies.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">7. CONTENT MODERATION AND REMOVAL</h3>
              <p>ED-Library reserves the unrestricted right to remove content, edit metadata, restrict visibility, suspend monetization, freeze payouts, and permanently terminate contributor access with or without notice, for any reason.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">8. COPYRIGHT COMPLAINTS</h3>
              <p>If ED-Library receives complaints alleging copyright infringement, we may immediately remove the content, suspend contributor privileges, and cooperate with rights holders and lawful authorities.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">9. REVENUE SHARING</h3>
              <p>Contributors receive 85% of eligible net revenue generated from their content, and ED-Library retains 15% as platform commission. Eligible net revenue excludes taxes, refunds, processing fees, chargebacks, and system errors.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">10. WITHDRAWALS AND PAYOUTS</h3>
              <p>Withdrawals are subject to identity verification, fraud checks, and payment processor availability. A 5% withdrawal processing fee applies to all withdrawals.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">11. PLATFORM ANALYTICS, AI, AND DATA PROCESSING</h3>
              <p>ED-Library may process uploaded content and usage statistics to train recommendation engines, machine learning systems, search indexing, and moderation tools.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">12. NO GUARANTEE OF EARNINGS</h3>
              <p>ED-Library does not guarantee revenue, downloads, discoverability, or financial outcomes. Success depends entirely on market demand and creative quality.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">13. ACCOUNT SECURITY</h3>
              <p>Contributors are responsible for protecting their credentials. ED-Library is not liable for unauthorized access resulting from user negligence.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">14. TAX RESPONSIBILITIES</h3>
              <p>Contributors are solely responsible for reporting income and paying taxes applicable in their respective jurisdictions.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">15. DISCLAIMERS & LIABILITY LIMITATIONS</h3>
              <p>Services are provided "as is". We are not responsible for service downtime, temporary loss of visibility, data loss, or academic outcomes. Total liability is limited to the amount paid to the contributor in the previous 6 months.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">16. INDEMNIFICATION</h3>
              <p>Contributors agree to indemnify and hold harmless ED-Library and its officers from claims, losses, or legal expenses arising from uploaded content, copyright disputes, or violations of these Terms.</p>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-800" />

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">17. GOVERNING LAW</h3>
              <p>These Terms shall be governed by and interpreted under the laws of the Federal Republic of Nigeria.</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 text-center">
            <Link
              href="/onboarding/step-1"
              className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition"
            >
              Understand & Return to Application
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
