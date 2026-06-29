// app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ED-Library",
  description:
    "Read the ED-Library Terms of Service. Understand your rights and responsibilities when using our educational platform.",
};

export default function TermsPage() {
  return (
    <section className="min-h-screen bg-transparent px-4 py-14">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <header className="mb-10 space-y-4">
          <h1
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white"
            style={{ paddingTop: 15 }}
          >
            Terms of Service
          </h1>
          <div className="h-1 w-12 rounded-full bg-gray-900 dark:bg-white" />
          <p className="max-w-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
            These terms govern your use of ED-Library. Please read them carefully before
            using the platform.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-100">
            Effective Date: June 29, 2026
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-6">

          {/* 1. Acceptance */}
          <div id="acceptance" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>
                By accessing or using ED-Library — including its website, mobile applications,
                APIs, and related services — you agree to be legally bound by these Terms of
                Service and our Privacy Policy.
              </p>
              <p>
                If you do not agree to these terms, you must not use the platform. ED-Library
                reserves the right to update these terms at any time. Continued use after
                updates constitutes acceptance of the revised terms.
              </p>
            </div>
          </div>

          {/* 2. Use of Platform */}
          <div id="use-of-platform" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">2. Use of Platform</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>ED-Library is an educational platform designed to help students access academic resources, courses, and lecture notes.</p>
              <p>You agree to use the platform only for lawful, educational purposes. You must not:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Use the platform to facilitate academic dishonesty or cheating</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Reverse engineer, scrape, or systematically extract content from the platform</li>
                <li>Use automated tools to access the platform without our written permission</li>
                <li>Upload, share, or distribute malicious, harmful, or illegal content</li>
                <li>Impersonate another user, contributor, or institution</li>
              </ul>
              <p>
                ED-Library reserves the right to suspend or terminate accounts that violate
                these usage guidelines without prior notice.
              </p>
            </div>
          </div>

          {/* 3. Intellectual Property */}
          <div id="intellectual-property" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">3. Intellectual Property</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>
                All platform design, branding, code, and original content created by ED-Library
                is the exclusive intellectual property of ED-Library and may not be reproduced,
                distributed, or used without explicit written permission.
              </p>
              <p>
                Content uploaded by contributors remains the intellectual property of the
                respective contributor, subject to the license granted to ED-Library as
                described in the Contributor Terms and Conditions.
              </p>
              <p>
                Purchasing a course or downloading materials grants you a personal,
                non-transferable, non-commercial licence to access that content for your own
                educational use only.
              </p>
            </div>
          </div>

          {/* 4. User Conduct */}
          <div id="user-conduct" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">4. User Conduct</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>All users of ED-Library are expected to conduct themselves in a respectful and lawful manner. You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Post or transmit harassing, defamatory, or offensive content</li>
                <li>Share copyrighted materials without proper authorization</li>
                <li>Engage in spamming, phishing, or any form of fraud</li>
                <li>Distribute examination leaks or confidential institutional materials</li>
                <li>Attempt to manipulate ratings, reviews, or platform metrics</li>
                <li>Use the platform in any way that disrupts or harms other users</li>
              </ul>
              <p>
                Violations may result in immediate account suspension and, where applicable,
                reporting to relevant authorities.
              </p>
            </div>
          </div>

          {/* 5. Disclaimers */}
          <div id="disclaimers" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">5. Disclaimers</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>
                ED-Library provides its services on an <span className="font-medium text-gray-900 dark:text-white">"as is"</span> and{" "}
                <span className="font-medium text-gray-900 dark:text-white">"as available"</span> basis without warranties of any kind,
                whether express or implied.
              </p>
              <p>We do not guarantee that:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>The platform will be available at all times or free from errors</li>
                <li>Academic content uploaded by contributors is accurate, complete, or up to date</li>
                <li>Use of platform content will improve academic performance or examination outcomes</li>
                <li>The platform is free from viruses or other harmful components</li>
              </ul>
              <p>
                Users access and use contributor materials entirely at their own risk and
                academic judgement.
              </p>
            </div>
          </div>

          {/* 6. Limitation of Liability */}
          <div id="limitation" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">6. Limitation of Liability</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>
                To the fullest extent permitted by applicable law, ED-Library and its
                founders, employees, affiliates, and partners shall not be liable for any:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data, academic outcomes, or reputation</li>
                <li>Business interruption or financial loss</li>
                <li>Damages arising from reliance on contributor-uploaded materials</li>
                <li>Issues caused by third-party service providers</li>
              </ul>
              <p>
                Our total aggregate liability for any claim arising from your use of the
                platform shall not exceed the total amount you have paid to ED-Library in the
                six months preceding the claim.
              </p>
            </div>
          </div>

          {/* 7. Changes to Terms */}
          <div id="changes" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">7. Changes to Terms</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>
                ED-Library reserves the right to modify these Terms of Service at any time.
                When we make material changes, we will update the effective date at the top
                of this page.
              </p>
              <p>
                We encourage you to review these terms periodically. Your continued use of the
                platform following the posting of changes constitutes your acceptance of those
                changes.
              </p>
              <p>
                If you disagree with any updated terms, you must stop using ED-Library and may
                request account deletion by contacting our support team.
              </p>
            </div>
          </div>

          {/* 8. Contact */}
          <div id="contact" className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">8. Contact</h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed">
              <p>
                For questions, complaints, or legal notices regarding these Terms of Service,
                please reach out to us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">Email:</span>{" "}
                  <a
                    href="mailto:support@mail.edlibrary.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@mail.edlibrary.com
                  </a>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">Address:</span> House DN 5,
                  Chinda Estate, Mile 3, Port Harcourt, Rivers State, Nigeria
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-white">Contact Page:</span>{" "}
                  <a href="/contact" className="text-blue-600 hover:underline">
                    ed-library.app/contact
                  </a>
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom note */}
        <p className="mt-10 text-xs text-gray-400 text-center leading-relaxed">
          These Terms of Service are governed by and construed under the laws of the Federal
          Republic of Nigeria. By using ED-Library, you submit to the jurisdiction of
          competent courts within Nigeria.
        </p>
      </div>
    </section>
  );
}
