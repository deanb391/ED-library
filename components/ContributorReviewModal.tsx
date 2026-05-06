"use client";

import { useState } from "react";
import { Contributor } from "@/lib/services/contributors.service";
import { editContributor } from "@/lib/api/contributors"; // 👈 your function

type Status = "pending" | "live" | "rejected";

interface Props {
  contributor: Contributor;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onPreviewImages: (images: string[], index: number) => void;
}

export default function ContributorReviewModal({
  contributor,
  onClose,
  onUpdateStatus,
  onPreviewImages,
}: Props) {
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(null);

  const getBadgeStyles = (status: string) => {
    if (status === "live") return { bg: "#dcfce7", text: "#166534" };
    if (status === "pending") return { bg: "#fef9c3", text: "#854d0e" };
    if (status === "rejected") return { bg: "#fee2e2", text: "#991b1b" };
    return { bg: "#f3f4f6", text: "#374151" };
  };

  const badge = getBadgeStyles(contributor.status);

  // 🔥 APPROVE
  const approve = async () => {
    if (loadingAction) return;

    setLoadingAction("approve");

    try {
      await editContributor(contributor.$id, {
        status: "live",
      }, "approval");

      onUpdateStatus(contributor.$id, "live");
    } catch (err) {
      console.error("APPROVE ERROR:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  // 🔥 REJECT
  const reject = async () => {
    if (loadingAction) return;

    setLoadingAction("reject");

    try {
      await editContributor(contributor.$id, {
        status: "rejected",
      }, "reject");

      onUpdateStatus(contributor.$id, "rejected");
    } catch (err) {
      console.error("REJECT ERROR:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "#fff",
          borderRadius: "1rem",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
            Contributor Details
          </h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* PROFILE */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <img
            src={contributor.profileImage}
            alt={contributor.username}
            style={{
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <p style={{ fontWeight: "600" }}>{contributor.username}</p>
            <span
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                backgroundColor: badge.bg,
                color: badge.text,
              }}
            >
              {contributor.status}
            </span>
          </div>
        </div>

        {/* DETAILS */}
        <div style={{ fontSize: "0.875rem", color: "#374151" }}>
          <p><strong>Description:</strong> {contributor.bio || "No description"}</p>
          <p>
            <strong>Categories:</strong>{" "}
            {contributor.category && contributor.category.length > 0
              ? contributor.category.join(", ")
              : "None"}
          </p>
        </div>

        {/* IMAGES */}
        <div>
          <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
            Review Images
          </p>

          <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto" }}>
            {(contributor.reviewImages || []).slice(0, 3).map((img, i) => (
              <img
                src={img}
                onClick={() =>
                  onPreviewImages(contributor.reviewImages || [], i)
                }
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "0.75rem",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {contributor.status === "pending" && (
            <>
              <button
                onClick={approve}
                disabled={loadingAction !== null}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  backgroundColor: "#1C64F2",
                  color: "#fff",
                  borderRadius: "0.5rem",
                  border: "none",
                  opacity: loadingAction ? 0.7 : 1,
                }}
              >
                {loadingAction === "approve" ? "Approving..." : "Approve"}
              </button>

              <button
                onClick={reject}
                disabled={loadingAction !== null}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  opacity: loadingAction ? 0.7 : 1,
                }}
              >
                {loadingAction === "reject" ? "Rejecting..." : "Reject"}
              </button>
            </>
          )}

          {contributor.status === "live" && (
            <button
              onClick={reject}
              disabled={loadingAction !== null}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #fca5a5",
                color: "#dc2626",
                borderRadius: "0.5rem",
                opacity: loadingAction ? 0.7 : 1,
              }}
            >
              {loadingAction === "reject" ? "Rejecting..." : "Reject"}
            </button>
          )}

          {contributor.status === "rejected" && (
            <button
              onClick={approve}
              disabled={loadingAction !== null}
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                opacity: loadingAction ? 0.7 : 1,
              }}
            >
              {loadingAction === "approve" ? "Approving..." : "Approve"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}