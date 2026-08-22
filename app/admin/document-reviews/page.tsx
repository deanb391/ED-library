"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from "@/context/UserContext";
import AccessWall from "@/components/AccessWall";
import { fetchDocumentReviewRequests, resolveDocumentReviewRequest } from '@/lib/api/documents';
import { ArrowLeft, CheckCircle, FileText, XCircle, Download, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

export default function DocumentReviewsAdmin() {
  const { user, loading } = useUser();
  const [requests, setRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeRequest, setActiveRequest] = useState<any | null>(null);

  useEffect(() => {
    if (user?.isAdmin) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    try {
      setFetching(true);
      const data = await fetchDocumentReviewRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user?.isAdmin) return <AccessWall type="admin" />;

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm hover:bg-gray-50 dark:bg-gray-900 transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Appeals</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review human-review requests for auto-rejected documents.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No document review requests found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((req) => (
                <div
                  key={req.$id}
                  onClick={() => setActiveRequest(req)}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:bg-gray-900 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      {req.userDetails?.avatar ? (
                        <img src={req.userDetails.avatar} alt="User" className="w-full h-full rounded-full" />
                      ) : (
                        <FileText size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{req.courseDetails?.title || "Unknown Course"}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">By {req.userDetails?.username || "Unknown User"}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 italic">"{req.complaint}"</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:flex-col sm:items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(req.$createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeRequest && (
        <ResolveModal
          request={activeRequest}
          onClose={() => setActiveRequest(null)}
          onResolved={() => {
            setActiveRequest(null);
            loadRequests();
          }}
        />
      )}
    </div>
  );
}

function ResolveModal({ request, onClose, onResolved }: { request: any, onClose: () => void, onResolved: () => void }) {
  const [resolving, setResolving] = useState(false);
  const [adminReason, setAdminReason] = useState("");

  const handleResolve = async (status: "approved" | "rejected") => {
    if (!adminReason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    setResolving(true);
    try {
      await resolveDocumentReviewRequest({
        requestId: request.$id,
        documentId: request.documents,
        status,
        adminReason
      });
      onResolved();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve request.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Review Appeal</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-5">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Course</p>
              <p className="font-medium text-gray-900 dark:text-white">{request.courseDetails?.title || "Unknown"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Contributor</p>
              <div className="flex items-center gap-2">
                {request.userDetails?.avatar && <img src={request.userDetails.avatar} className="w-6 h-6 rounded-full" />}
                <p className="font-medium text-gray-900 dark:text-white">{request.userDetails?.username || "Unknown"}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold mb-1">Contributor's Complaint</p>
              <p className="text-gray-800 dark:text-gray-300 text-sm italic">"{request.complaint}"</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">Document Details</p>
              {request.documentDetails ? (
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <FileText size={24} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{request.documentDetails.fileName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{(request.documentDetails.fileSize / 1024 / 1024).toFixed(2)} MB • {request.documentDetails.fileType}</p>
                    </div>
                  </div>
                  <a
                    href={request.documentDetails.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              ) : (
                <p className="text-sm text-red-500">Document no longer exists.</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Reason</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                rows={3}
                placeholder="Reason for approval or rejection..."
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                disabled={resolving}
              ></textarea>
            </div>

          </div>
        </div>


        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={() => handleResolve('rejected')}
            disabled={resolving || !adminReason.trim()}
            className="flex-1 py-2.5 bg-white dark:bg-gray-900 border border-red-200 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <XCircle size={18} /> Reject
          </button>
          <button
            onClick={() => handleResolve('approved')}
            disabled={resolving || !adminReason.trim()}
            style={{ color: "blue", borderColor: "blue" }}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle size={18} /> Approve
          </button>
        </div>

      </div>
    </div>
  );
}
