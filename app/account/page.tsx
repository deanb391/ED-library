"use client";

import Image from "next/image";
import { useUser } from "@/context/UserContext";
import clsx from "clsx";

export default function AccountScreen() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] text-gray-500">
        Not logged in. Which already explains a lot.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 py-6">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Header card */}
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt="Avatar"
                
                width={400}
          height={240}
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-600">
                {user.username?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {user.username}
            </h2>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>

            <span
              className={clsx(
                "inline-block mt-2 px-2 py-0.5 text-xs rounded-full font-medium",
                user.isAdmin
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              )}
              style={{color: user.isAdmin ? 
                "red" : "blue"}}
            >
              {user.isAdmin ? "Admin" : "User"}
            </span>
          </div>
        </div>

        {/* Info card */}
        <div className="rounded-2xl bg-white shadow-sm divide-y">
          <InfoRow label="Department" value={user.department || "—"} />
          <InfoRow label="Level" value={(user.level ?? "-") + "lvl"} />
          <InfoRow
            label="Account Created"
            value={formatDate(user.$createdAt)}
          />
          {/* <InfoRow
            label="Last Active"
            value={user.lastTime ? formatDate(user.lastTime) : "—"}
          /> */}
        </div>
      </div>
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
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
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
