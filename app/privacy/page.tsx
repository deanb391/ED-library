// app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ED-Library",
  description:
    "Learn how ED-Library collects, uses, and protects your personal data. Read our full privacy policy to understand your rights and our data practices.",
};

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: (
      <>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Welcome to ED-Library. We are committed to protecting your privacy and handling
          your personal data with care and transparency. This Privacy Policy explains how
          we collect, use, store, and protect information when you use our platform,
          including our website, mobile applications, and related services.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          By using ED-Library, you agree to the practices described in this policy. If you
          do not agree, please discontinue use of the platform.
        </p>
      </>
    ),
  },
  {
    id: "data-collection",
    title: "2. Data We Collect",
    content: (
      <>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          We collect the following types of information to provide and improve our services:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Account Information:</span> Your name,
            email address, username, profile image, and institution details when you register.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Usage Data:</span> Pages visited,
            courses browsed, search queries, and time spent on the platform.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Device & Technical Data:</span> IP
            address, browser type, operating system, and device identifiers.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Content Interactions:</span> Courses
            saved to your library, courses purchased, and contributor profiles you follow.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Payment Information:</span> Transaction
            records for course purchases (payment details are processed by third-party
            providers and not stored by us directly).
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Communications:</span> Messages or
            inquiries you send to our support team.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "data-usage",
    title: "3. How We Use Your Data",
    content: (
      <>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          The information we collect is used for the following purposes:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>To provide, maintain, and improve the ED-Library platform and its features.</li>
          <li>To personalise your experience, including course recommendations and relevant content.</li>
          <li>To process transactions, manage your library, and handle contributor payouts.</li>
          <li>To send important notices such as account updates, security alerts, and policy changes.</li>
          <li>To detect, prevent, and address fraud, abuse, and technical issues.</li>
          <li>To analyse platform usage patterns and improve our services.</li>
          <li>To comply with legal obligations and enforce our terms.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies",
    content: (
      <>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          ED-Library uses cookies and similar tracking technologies to enhance your experience.
          These include:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Essential Cookies:</span> Required for
            the platform to function, including keeping you signed in.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Analytics Cookies:</span> Help us
            understand how the platform is used (e.g., Google Analytics, PostHog).
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Advertising Cookies:</span> Used to
            serve relevant advertisements through third-party ad networks (e.g., Google AdSense).
          </li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          You can control cookies through your browser settings. Disabling cookies may limit
          some features of the platform.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "5. Third-Party Services",
    content: (
      <>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          ED-Library integrates with trusted third-party services that may process your data
          according to their own privacy policies:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Appwrite:</span> Backend infrastructure
            for authentication, database, and file storage.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Google Analytics:</span> Usage analytics
            and behaviour tracking.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">PostHog:</span> Product analytics and
            session tracking.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Google AdSense:</span> Advertising
            platform that may set its own cookies.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Payment Processors:</span> Third-party
            payment gateways for secure transaction handling.
          </li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          We encourage you to review the privacy policies of these providers for further details.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: (
      <>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          Depending on your location, you may have the following rights regarding your
          personal data:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Access:</span> Request a copy of the
            personal data we hold about you.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Correction:</span> Request that
            inaccurate or incomplete data be corrected.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Deletion:</span> Request that your
            personal data be deleted, subject to legal obligations.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Restriction:</span> Request that we
            limit how we process your data in certain circumstances.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Objection:</span> Object to processing
            based on our legitimate interests.
          </li>
          <li>
            <span className="font-medium text-gray-900 dark:text-white">Portability:</span> Request transfer of
            your data to another service where technically feasible.
          </li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
          To exercise any of these rights, please contact us using the details in Section 7.
          We will respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "7. Contact Us",
    content: (
      <>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          If you have questions, concerns, or requests regarding this Privacy Policy or your
          personal data, please contact us:
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
            <span className="font-semibold text-gray-900 dark:text-white">Address:</span> House DN 5, Chinda
            Estate, Mile 3, Port Harcourt, Rivers State, Nigeria
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-white">Contact Page:</span>{" "}
            <a href="/contact" className="text-blue-600 hover:underline">
              ed-library.app/contact
            </a>
          </p>
        </div>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <section className="min-h-screen bg-transparent px-4 py-14">
      <div className="mx-auto max-w-3xl">
        {/* Page Header */}
        <header className="mb-10 space-y-4">
          <h1
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white"
            style={{ paddingTop: 15 }}
          >
            Privacy Policy
          </h1>
          <div className="h-1 w-12 rounded-full bg-gray-900 dark:bg-white" />
          <p className="max-w-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
            We believe transparency is the foundation of trust. Here is how we handle
            your data — clearly and honestly.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-100">
            Last updated: January 9, 2026
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition"
            >
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <div className="text-sm leading-relaxed">{section.content}</div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-xs text-gray-400 text-center leading-relaxed">
          This Privacy Policy applies to all users of ED-Library. ED-Library reserves the
          right to update this policy at any time. Continued use of the platform constitutes
          acceptance of the latest version.
        </p>
      </div>
    </section>
  );
}
