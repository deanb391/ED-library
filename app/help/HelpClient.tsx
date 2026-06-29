// app/help/HelpClient.tsx
"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  User,
  Wrench,
  MessageCircle,
  Rocket,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type FAQItem = {
  question: string;
  answer: string;
};

type HelpSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  faqs: FAQItem[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Rocket size={20} className="text-blue-600" />,
    faqs: [
      {
        question: "How do I create an ED-Library account?",
        answer:
          "Visit the Sign Up page and provide your email address, a username, and a password. After submitting, check your inbox for a verification email and follow the link to activate your account.",
      },
      {
        question: "Do I need an account to browse courses?",
        answer:
          "No — you can browse and view course listings without an account. However, you will need to sign in to save courses to your library, unlock paid content, or follow contributors.",
      },
      {
        question: "Is ED-Library free to use?",
        answer:
          "ED-Library is free to join. Many courses and lecture notes are available at no cost. Some courses are marked as paid and can be purchased individually through the platform.",
      },
      {
        question: "How do I complete my profile?",
        answer:
          "After signing in, navigate to Account in the top menu. From there you can upload a profile picture, fill in your institution details, and update your personal information.",
      },
    ],
  },
  {
    id: "courses-lectures",
    title: "Courses & Lectures",
    icon: <BookOpen size={20} className="text-blue-600" />,
    faqs: [
      {
        question: "How do I find a specific course?",
        answer:
          "Use the search bar on the Home page to search by course name, course code, subject, or contributor name. You can also browse by category or department from the All Courses page.",
      },
      {
        question: "How do I save a course to my library?",
        answer:
          "Open any course page and tap the 'Save to Library' button. Saved courses are accessible from the Library section in your navigation menu, so you can revisit them any time.",
      },
      {
        question: "What file formats are lecture notes available in?",
        answer:
          "Most lecture notes are provided as PDF documents. Some contributors may also include images, slides, or text-based documents. The platform includes a built-in viewer so you can read materials without downloading them.",
      },
      {
        question: "Can I download course materials?",
        answer:
          "Download availability depends on the individual course settings configured by the contributor. If a download option is available, it will appear on the course or note viewer page.",
      },
      {
        question: "How do I purchase a paid course?",
        answer:
          "Navigate to the course page and tap 'Get Access'. You will be prompted to complete payment through our secure payment processor. Once confirmed, the course is immediately available in your library.",
      },
    ],
  },
  {
    id: "account-profile",
    title: "Account & Profile",
    icon: <User size={20} className="text-blue-600" />,
    faqs: [
      {
        question: "How do I reset my password?",
        answer:
          "On the Sign In page, click 'Forgot password?' and enter your registered email address. You will receive a password reset link within a few minutes. Check your spam folder if it does not arrive.",
      },
      {
        question: "Can I change my username or email?",
        answer:
          "Yes. Go to Account settings to update your username. Email changes may require re-verification for security. If you encounter difficulties, contact our support team.",
      },
      {
        question: "How do I follow a contributor?",
        answer:
          "Open a contributor's profile page and click the 'Follow' button. You can also follow contributors directly from their course cards on the Home feed.",
      },
      {
        question: "How do I become a contributor?",
        answer:
          "Navigate to the 'Become a Contributor' page from the navigation menu. Complete the application form, agree to the Contributor Terms, and submit for review. Our team typically reviews applications within a few business days.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Account deletion requests must be submitted via our support email. Please contact support@mail.edlibrary.com with your registered email address and we will process your request within 30 days.",
      },
    ],
  },
  {
    id: "technical-issues",
    title: "Technical Issues",
    icon: <Wrench size={20} className="text-blue-600" />,
    faqs: [
      {
        question: "The platform is loading slowly — what should I do?",
        answer:
          "Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection. If the issue persists across multiple sessions, please contact our support team.",
      },
      {
        question: "A PDF or document is not loading in the viewer.",
        answer:
          "First, try refreshing the page. If the document still fails to load, try opening it in a different browser. Very large documents may take longer to load on slower connections. If the problem continues, report it to us with the course name and link.",
      },
      {
        question: "I am getting a payment error. What should I do?",
        answer:
          "Payment errors may be caused by insufficient funds, card restrictions, or temporary issues with our payment processor. Double-check your card details, try a different payment method, or try again after a few minutes.",
      },
      {
        question: "I cannot sign in to my account.",
        answer:
          "Ensure you are using the correct email and password. Use the 'Forgot password?' link if needed. If your account has been suspended or flagged, you will receive an email notification. Contact support if you believe this is an error.",
      },
    ],
  },
  {
    id: "contact-support",
    title: "Contact Support",
    icon: <MessageCircle size={20} className="text-blue-600" />,
    faqs: [
      {
        question: "How can I contact the ED-Library support team?",
        answer:
          "You can reach us by email at support@mail.edlibrary.com, via WhatsApp at +234 906 366 6391, or through our Contact page. Our team is available Monday to Friday, 9am–5pm WAT.",
      },
      {
        question: "How long does it take to get a response?",
        answer:
          "We aim to respond to all email enquiries within 24–48 business hours. WhatsApp messages typically receive a response within 15–30 minutes during business hours.",
      },
      {
        question: "How do I report inappropriate content?",
        answer:
          "If you encounter content that violates our guidelines, please email us at support@mail.edlibrary.com with the course name or link and a brief description. We review all reports and act promptly.",
      },
    ],
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({ question, answer }: FAQItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
        aria-expanded={open}
      >
        <span>{question}</span>
        {open ? (
          <ChevronUp size={16} className="shrink-0 text-blue-600" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-gray-400" />
        )}
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

// ─── Help Section Card ────────────────────────────────────────────────────────

function HelpCard({ section }: { section: HelpSection }) {
  return (
    <div
      id={section.id}
      className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          {section.icon}
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{section.title}</h2>
      </div>
      <div>
        {section.faqs.map((faq, i) => (
          <AccordionItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function HelpClient() {
  const [query, setQuery] = useState("");

  return (
    <section className="min-h-screen bg-transparent px-4 py-14">
      <div className="mx-auto max-w-3xl">

        {/* Page Header */}
        <header className="mb-10 space-y-4">
          <h1
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white"
            style={{ paddingTop: 15 }}
          >
            Help Center
          </h1>
          <div className="h-1 w-12 rounded-full bg-gray-900 dark:bg-white" />
          <p className="max-w-2xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Find answers to common questions about ED-Library. If you can&apos;t
            find what you&apos;re looking for, our team is always here to help.
          </p>
        </header>

        {/* Search Bar (UI only) */}
        <div className="relative w-full mb-10">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            id="help-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help topics…"
            className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Quick Nav Pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {helpSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 transition shadow-sm"
            >
              {section.icon}
              {section.title}
            </a>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {helpSections.map((section) => (
            <HelpCard key={section.id} section={section} />
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-10 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto">
            <MessageCircle size={22} className="text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Still need help?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            Our support team is ready to assist you with anything not covered here.
            Reach out and we&apos;ll get back to you promptly.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all active:scale-[0.97] shadow-sm"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </section>
  );
}
