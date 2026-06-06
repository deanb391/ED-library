"use client";

import Link from "next/link";
import { PlusCircle, UploadCloud, Megaphone, Users, BarChart2, TrendingUp, DollarSign, FileText } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next-nprogress-bar";
import { useEffect } from "react";

import AccessWall from "@/components/AccessWall";

export default function AdminDashboard() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FB] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  if (!user) {
    return <AccessWall type="user" />;
  }

  if (!user.isAdmin) {
    return <AccessWall type="admin" />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage courses, users, and platform content.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ActionCard
            title="Create Course"
            description="Launch a new course and publish learning materials."
            icon={<PlusCircle size={24} className="text-blue-600" />}
            href="/contributor/dashboard/create-course"
          />
          <ActionCard
            title="Upload Assets"
            description="Batch upload notes and course assets for published classes."
            icon={<UploadCloud size={24} className="text-purple-600" />}
            href="/admin/upload"
          />
          <ActionCard
            title="Manage Ads"
            description="Create and manage advertisement campaigns."
            icon={<Megaphone size={24} className="text-green-600" />}
            href="/admin/ads"
          />
          <ActionCard
            title="Contributor Review"
            description="Review and approve new contributor applications."
            icon={<Users size={24} className="text-orange-600" />}
            href="/admin/contributor-review"
          />
          <ActionCard
            title="Document Appeals"
            description="Review human-review requests for auto-rejected documents."
            icon={<FileText size={24} className="text-red-600" />}
            href="/admin/document-reviews"
          />
        </div>

        {/* Analytics Section */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={20} className="text-blue-600" />
            Analytics & Business Intelligence
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ActionCard
              title="Acquisition"
              description="Track signups, daily active users, and user demographics."
              icon={<TrendingUp size={24} className="text-blue-600" />}
              href="/analytics?tab=acquisition"
            />
            <ActionCard
              title="Contributors"
              description="Monitor contributor applications, uploads, and course creation."
              icon={<Users size={24} className="text-indigo-600" />}
              href="/analytics?tab=contributors"
            />
            <ActionCard
              title="Revenue"
              description="Track wallet topups, subscriptions, withdrawals, and platform earnings."
              icon={<DollarSign size={24} className="text-emerald-600" />}
              href="/analytics?tab=revenue"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon, href }: { title: string; description: string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="block h-full">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer h-full flex flex-col items-start gap-4 active:scale-[0.98]">
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
}
