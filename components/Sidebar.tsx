"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Library, Users, User, Menu, LayoutDashboard } from "lucide-react";
import { useHome } from "@/context/HomeContext";
import { useUser } from "@/context/UserContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarExpanded, setIsSidebarExpanded } = useHome();
  const { user, contributor } = useUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Library", href: "/library", icon: Library },
    { label: "Community", href: "/community", icon: Users },
    { label: "Profile", href: "/account", icon: User },
    ...(contributor ? [{ label: "Dashboard", href: `/contributor/dashboard/${contributor.$id}`, icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      {/* Overlay to catch clicks outside the expanded sidebar on mobile */}
      {isSidebarExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden top-[72px]"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}
      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-[72px] md:top-[72px] h-[calc(100vh-72px)] bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-40 
          ${isSidebarExpanded ? "w-64 translate-x-0" : "w-[72px] -translate-x-full md:translate-x-0"} 
        `}
      >
        <nav className="flex-1 px-2 mt-4 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            
            const handleClick = (e: React.MouseEvent) => {
              setIsSidebarExpanded(false);
              if (item.label === "Profile" && !user) {
                e.preventDefault();
                router.push("/signin");
              }
            };

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClick}
                className={`flex rounded-xl transition-colors ${
                  isSidebarExpanded 
                    ? "items-center px-3 py-3" 
                    : "flex-col items-center justify-center py-4 px-1"
                } ${
                  isActive 
                    ? "bg-gray-100 dark:bg-gray-900 font-semibold text-gray-900 dark:text-white" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                }`}
                title={!isSidebarExpanded && !isMobileOpen ? item.label : ""}
              >
                <item.icon 
                  size={isSidebarExpanded ? 24 : 22} 
                  className={`shrink-0 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`} 
                />
                
                {/* Expanded text */}
                <span 
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isSidebarExpanded || isMobileOpen ? "ml-4 text-[15px] w-auto opacity-100" : "hidden"
                  }`}
                >
                  {item.label}
                </span>

                {/* Collapsed text (like YouTube) */}
                <span 
                  className={`mt-1 text-[10px] whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    !isSidebarExpanded && !isMobileOpen ? "block opacity-100" : "hidden"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* Theme Toggle placed right after items so it is definitely visible */}
          <div className={`mt-8 mb-20 flex ${isSidebarExpanded ? "justify-start px-2" : "justify-center"}`}>
            <ThemeToggle />
          </div>
        </nav>
      </aside>
    </>
  );
}
