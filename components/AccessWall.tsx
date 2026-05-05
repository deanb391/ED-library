"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ShieldAlert, UserX, ArrowLeft, Home, LogIn, Timer } from "lucide-react";
import { useRouter } from "next/navigation";

interface AccessWallProps {
  type: "user" | "contributor" | "admin";
}

export default function AccessWall({ type }: AccessWallProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/signin");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const config = {
    user: {
      icon: <UserX size={48} className="text-red-500" />,
      title: "Whoa there, Stranger!",
      description:
        "We're honestly impressed you found your way here, but this area is strictly for signed-in members. No ticket, no entry!",
      primaryAction: {
        label: "Sign In",
        href: "/signin",
        icon: <LogIn size={18} />,
      },
    },
    contributor: {
      icon: <ShieldAlert size={48} className="text-orange-500" />,
      title: "Contributor Access Only",
      description:
        "You're not a contributor yet, so that explains why you can't see this. Want to change that and start sharing your knowledge?",
      primaryAction: {
        label: "Become a Contributor",
        href: "/become-a-contributor",
        icon: <PlusIcon />,
      },
    },
    admin: {
      icon: <Lock size={48} className="text-purple-600" />,
      title: "Restricted Zone",
      description:
        "This is the control room. Unless you're an admin, there's nothing for you to see here. Move along, citizen!",
      primaryAction: {
        label: "Back to Safety",
        href: "/",
        icon: <Home size={18} />,
      },
    },
  };

  const { icon, title, description, primaryAction } = config[type];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 text-center transform transition-all hover:scale-[1.01]">

        {/* Countdown Progress Bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 5) * 100}%` }}
          />
        </div>

        <div className="flex justify-center mb-6 animate-bounce-subtle">
          <div className="p-4 bg-gray-50 rounded-full">{icon}</div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        <div className="flex flex-col gap-3">
          <Link href={primaryAction.href}>
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-[0.95] shadow-lg shadow-blue-200">
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          <Timer size={14} className="animate-spin-slow" />
          <span>Redirecting to sign in in {countdown}s...</span>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-400 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <ArrowLeft size={14} />
            Go back to where you came from
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
