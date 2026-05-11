"use client";

import { useEffect, useState } from "react";
import { uploadThumbnail } from "@/lib/api/courses";
import { editCourse } from "@/lib/api/courses";
import { bool } from "aws-sdk/clients/signer";
import { Currency } from "lucide-react";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    code: string;
    description: string;
    university?: string;
    lecturer?: string;
    thumbnailId?: string;
    thumbnailUrl?: string;
    isOngoing?: boolean;
    price?: string;
  };
  onUpdated?: (updated: Partial<any>) => void;
}

export default function EditCourseModal({
  isOpen,
  onClose,
  course,
  onUpdated,
}: EditCourseModalProps) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [university, setUniversity] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnGoing, setIsOnGoing] = useState(false);
  const [amount, setAmount] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [parse, setParsed] = useState<any>({})


  useEffect(() => {
    if (!isOpen) return;

    setTitle(course.title);
    setCode(course.code);
    setDescription(course.description);
    setUniversity(course.university || "");
    setLecturer(course.lecturer || "");
    setIsOnGoing(course.isOngoing || true)

    try {
      const parsed = JSON.parse((course as any).price || "{}");
      console.log("Parsed: ", parsed)
      setParsed(parsed);

      setIsOnGoing(parsed?.type === "subscription");
      setIsFree(parsed.isFree)

      if (parsed?.type === "subscription") {

        setAmount(parsed.amount || 0);
      } else {
        setAmount(parsed.amount || 0);
      }
    } catch {
      setIsOnGoing(false);
      setAmount(0);
    }

  }, [isOpen, course]);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        title,
        code,
        description,
        university,
        lecturer: lecturer || undefined,
        isOnGoing,
        price: JSON.stringify(
          {
            type: isOnGoing ? "subscription" : "one-time",
            currency: parse.currency,
            isFree: amount > 0 ? false : true,
            amount: amount,
          }
        )
      };

      if (thumbnail) {
        const uploaded = await uploadThumbnail(thumbnail);
        payload.thumbnailId = uploaded.fileId;
        payload.thumbnailUrl = uploaded.url;
      }

      await editCourse(course.id, payload);

      onUpdated?.(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "80vh",
          backgroundColor: "#fff",
          borderRadius: "24px",
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Edit course
          </h2>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            minHeight: 0,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Title */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: 500 }}>
                Course title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  marginTop: "6px",
                }}
              />
            </div>

            {/* Code */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: 500 }}>
                Course code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  marginTop: "6px",
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: 500 }}>
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  marginTop: "6px",
                  resize: "none",
                }}
              />
            </div>

            {/* University */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: 500 }}>
                University
              </label>
              <input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  marginTop: "6px",
                }}
              />
            </div>

            {/* Lecturer */}
            <div>
              <label style={{ fontSize: "14px", fontWeight: 500 }}>
                Lecturer
              </label>
              <input
                value={lecturer}
                onChange={(e) => setLecturer(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  marginTop: "6px",
                }}
              />
            </div>

            {/* File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change thumbnail <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setThumbnail(e.target.files ? e.target.files[0] : null)
                }
                className="block w-full text-sm text-gray-600
                           file:mr-4 file:py-2.5 file:px-4
                           file:rounded-xl file:border-0
                           file:bg-blue-50 file:text-blue-600"
              />
            </div>

            {/* Toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: 500 }}>
                Is Ongoing
              </span>
              <input
                type="checkbox"
                checked={isOnGoing}
                onChange={(e) => {
                  setIsOnGoing(e.target.checked)
                  setAmount(0)
                }}
              />
            </div>

            {/* Price */}
            {
              !isOnGoing && (
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 500 }}>
                    Price Per Page (NGN)
                  </label>

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      marginTop: "10px",
                    }}
                    placeholder="Enter price per page"
                  />
                </div>
              )
            }

            {
              isOnGoing && (
                <div>
                  <label style={{ fontSize: "14px", fontWeight: 500 }}>
                    Subscription Price (NGN)
                  </label>

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                      marginTop: "10px",
                    }}
                    placeholder="Enter subscription price"
                  />
                </div>
              )
            }

            <div
              style={{
                padding: "16px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button onClick={onClose} style={{ color: "#6b7280" }}>
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                }}
              >
                {isLoading ? "Saving…" : "Save"}
              </button>

            </div>
          </form>
        </div>


      </div>
    </div>
  );
}
