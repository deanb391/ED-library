"use client";

import Image from "next/image";
import { useUser } from "@/context/UserContext";
import clsx from "clsx";
import AccessWall from "@/components/AccessWall";
import { useEffect, useState } from "react";
import { getMyContributor } from "@/lib/api/contributors";
import { Contributor } from "@/lib/services/contributors.service";
import ShareProfileButton from "@/components/ShareProfileButton";
import EditContributorModal from "@/components/EditContributorModal";
import Link from "next/link";
import { 
  User, 
  Shield, 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  FileText, 
  Info, 
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function AccountScreen() {
  const { user, loading } = useUser();
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loadingContributor, setLoadingContributor] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isEditingContributor, setIsEditingContributor] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchContributor = async () => {
      try {
        const data = await getMyContributor(user.$id);
        setContributor(data);
      } catch (error) {
        console.error("Error fetching contributor:", error);
      } finally {
        setLoadingContributor(false);
      }
    };
    fetchContributor();
  }, [user]);

  if (loading || loadingContributor) {
    return (
      <div className="min-h-screen bg-white dark:bg-black px-4 py-8 md:py-12 animate-pulse">
        <div className="mx-auto max-w-2xl">
          {/* Skeleton Profile Section */}
          <div className="space-y-6 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>

            <div className="flex gap-5 items-center mt-6">
              <div className="h-24 w-24 shrink-0 rounded-full bg-gray-200 dark:bg-gray-800"></div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>

            <div className="w-full mt-6 h-12 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900"></div>
          </div>

          {/* Skeleton Menu Items Section */}
          <div className="pt-4">
            <div className="flex flex-col">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="flex items-center justify-between py-6 border-b border-gray-100 dark:border-gray-900">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  const menuItems = [
    { label: "Account", icon: <User size={22} />, href: "/account" },
    ...(!user?.isPremium ? [{ label: "ED-Library Premium", icon: <Shield size={22} />, href: "/premium" }] : []),
    ...(contributor
      ? [{ label: "Dashboard", icon: <LayoutDashboard size={22} />, href: `/contributor/dashboard/${contributor.$id}` }]
      : [{ label: "Become a Contributor", icon: <Shield size={22} />, href: "/become-a-contributor" }]),
    { label: "Payments", icon: <CreditCard size={22} />, href: "/payments" },
    { label: "Settings", icon: <Settings size={22} />, href: "/settings" },
    { label: "Help Center", icon: <HelpCircle size={22} />, href: "/help" },
    { label: "Terms and Policies", icon: <FileText size={22} />, href: "/terms" },
    { label: "About Us", icon: <Info size={22} />, href: "/about" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black px-4 py-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        
        {/* Profile Section */}
        {contributor && !showUserDetails ? (
          // Contributor Profile View
          <div className="space-y-6 pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contributor Profile</h3>
              <div className="flex items-center gap-4">
                <ShareProfileButton contributorId={contributor.$id} />
                <button
                  onClick={() => setIsEditingContributor(true)}
                  className="text-sm font-bold text-black dark:text-white hover:opacity-70 transition-opacity"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="flex gap-5 items-center mt-6">
              {contributor.profileImage ? (
                <div className="h-24 w-24 shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                  <Image
                    src={contributor.profileImage}
                    alt={contributor.username}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 shrink-0 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-3xl font-extrabold text-black dark:text-white">
                  {contributor.username?.[0]?.toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-3xl font-extrabold text-black dark:text-white truncate">{contributor.username}</p>
                {contributor.institution && (
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {[contributor.institution].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>

            {contributor.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                {contributor.bio}
              </p>
            )}

            {contributor.category && contributor.category.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {contributor.category.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 text-xs font-bold border border-black dark:border-white text-black dark:text-white rounded-full capitalize"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <button 
              onClick={() => setShowUserDetails(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              See User Details
              <ChevronDown size={16} />
            </button>
          </div>
        ) : (
          // User Profile View
          <div className="space-y-6 pb-8 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">User Profile</h3>
            
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Avatar"
                    width={400}
                    height={240}
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-extrabold text-black dark:text-white">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h2 className="text-3xl font-extrabold text-black dark:text-white truncate">
                  {user.username}
                </h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{user.email}</p>

                <span
                  className={clsx(
                    "inline-block mt-3 px-4 py-1.5 text-xs rounded-full font-bold uppercase tracking-wider border",
                    user.isAdmin
                      ? "border-black dark:border-white text-black dark:text-white"
                      : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  )}
                >
                  {user.isAdmin ? "Admin" : "User"}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <InfoRow label="Department" value={user.department || "—"} />
              <InfoRow label="Level" value={(user.level ?? "-") + "lvl"} />
              <InfoRow label="Account Created" value={formatDate(user.$createdAt)} />
            </div>

            {contributor && (
              <button 
                onClick={() => setShowUserDetails(false)}
                className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-bold text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                Hide User Details
                <ChevronUp size={16} />
              </button>
            )}
          </div>
        )}

        {/* Menu Items Section */}
        <div className="pt-4">
          <div className="flex flex-col">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center justify-between py-5 border-b-2 border-gray-100 dark:border-gray-900 hover:pl-2 transition-all group"
              >
                <div className="flex items-center gap-4 text-black dark:text-white">
                  <div className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-bold text-base md:text-lg">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>

      {isEditingContributor && contributor && (
        <EditContributorModal
          contributor={contributor}
          onClose={() => setIsEditingContributor(false)}
          onSuccess={(updated) => {
            setContributor(updated);
            setIsEditingContributor(false);
          }}
        />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-extrabold text-black dark:text-white">{value}</span>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
