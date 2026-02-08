"use client";

import React, { useEffect, useState } from "react";
import { fetchAds } from "@/lib/ads";
import { useRouter } from "next/navigation";



interface Ad {
  id: string;
  name: string;
  squareImages: string[];
  rectImages: string[];
  videos: string[];
  views: number;
  uniqueUsers: string[];
  isExpired: boolean;
  endTime: string;
  type: string;
}

export default function AllAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [filter, setFilter] = useState<{ name?: string; type?: string; isExpired?: boolean }>({});
  const router = useRouter()

  const loadAds = async (reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await fetchAds({ limit: 10, cursor: reset ? undefined : nextCursor, filter });
      
      setAds(prev => reset ? res.ads : [...prev, ...res.ads]);
      setNextCursor(res.nextCursor);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch ads");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadAds(true); // load initial ads
  }, [filter]);

  return (
    <div className="min-h-screen px-4 py-10 bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-semibold text-black" style={{color: "black"}}>
    All Ads
  </h1>

  <button
    onClick={() => router.push("/admin/ads/create")}
    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-all active:scale-[0.90]"
  >
    Create Ad
  </button>
</div>

        

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap mt-10">
          <input
            type="text"
            placeholder="Search by name"
            value={filter.name || ""}
            onChange={(e) => setFilter(prev => ({ ...prev, name: e.target.value }))}
            className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-60 text-blue-600"
          />
          <select
            value={filter.type || ""}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
            className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-600"
          >
            <option value="" style={{color: "black"}}>All Types</option>
            <option value="daily" style={{color: "black"}}>Daily</option>
            <option value="2-daily" style={{color: "black"}}>2-Daily</option>
            <option value="weekly" style={{color: "black"}}>Weekly</option>
            <option value="2-weekly" style={{color: "black"}}>2-Weekly</option>
            <option value="monthly" style={{color: "black"}}>Monthly</option>
          </select>
          <select
            value={filter.isExpired !== undefined ? String(filter.isExpired) : ""}
            onChange={(e) =>
              setFilter(prev => ({
                ...prev,
                isExpired:
                  e.target.value === ""
                    ? undefined
                    : e.target.value === "true",
              }))
            }
            className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 text-blue-600"
            
          >
            <option value="" style={{color: "black"}}>All Status</option>
            <option value="false" style={{color: "black"}}>Active</option>
            <option value="true" style={{color: "black"}}>Expired</option>
          </select>
          <button
            onClick={() => loadAds(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition"
          >
            Apply
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">End Time</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-100 hover:bg-gray-50" onClick={() => {
                    router.push(`/admin/ads/ad/${ad.id}`)
                }}>
                  <td className="px-4 py-3 text-blue-600" style={{color: "black", textTransform: 'capitalize', }}>{ad.name}</td>
                  <td className="px-4 py-3 capitalize text-blue-600" style={{color: "black", textTransform: 'capitalize'}}>{ad.type}</td>
                  <td className={`px-4 py-3 ${ad.isExpired ? "text-red-600" : "text-green-500"}`} style={{color:ad.isExpired ?"red":  "green"}}>
                    {ad.isExpired ? "Expired" : "Active"}
                  </td>
                  <td className="px-4 py-3 text-blue-600">{new Date(ad.endTime).toLocaleString()}</td>
                </tr>
              ))}
              {ads.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                    No ads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {nextCursor && (
          <div className="mt-6 text-center">
            <button
              onClick={() => loadAds()}
              disabled={loadingMore}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-500 transition disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}

        {loading && ads.length === 0 && (
          <p className="text-center py-10 text-gray-500">Loading ads…</p>
        )}
      </div>
    </div>
  );
}
