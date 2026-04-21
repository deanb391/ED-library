"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import deskImg from "@/assets/images/desk.webp";
import { Course, fetchCoursesByAdmin } from "@/lib/api/courses";
import { useParams, useRouter } from "next/navigation";
import { getContributor } from "@/lib/api/contributors";

const BRAND_BLUE = "#2563EB";

type SelectableCourse = Course & {
  included: boolean;
};

export default function SubscribeToCreatorPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [courses, setCourses] = useState<SelectableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributor, setContributor] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const fetch_contributor_courses = async () => {
      try {
        setLoading(true);

        const contributorRes = await getContributor(slug);
        setContributor(contributorRes);

        if(!contributorRes) return;

        const courseRes = await fetchCoursesByAdmin(contributorRes.user);

        const normalizedCourses: SelectableCourse[] = (courseRes || []).map(
          (c: Course) => ({
            ...c,
            included: true,
          })
        );

        setCourses(normalizedCourses);
      } catch (error) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetch_contributor_courses();
  }, [slug]);

  const hasSelectedCourses = courses.some((c) => c.included);

  const toggleCourse = (id: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, included: !c.included } : c
      )
    );
  };

  const handleProceed = () => {
    const selectedIds = courses
      .filter((c) => c.included)
      .map((c) => c.id);

    const query = selectedIds.join(",");

    router.push(
      `/subscribe/usbscribe-to-contributor/checkout?courses=${query}`
    );
  };

  const monthlyTotal = courses.reduce((sum, c) => {
    const priceData = c.price ? JSON.parse(c.price) : null;
    if (!c.included || priceData?.isFree) return sum;
    return sum + (priceData?.amount || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-solid mb-4"></div>
        <p className="text-gray-700 text-sm">Loading, please wait...</p>
      </div>
    );
  }

  return (
    <div
  style={{
    minHeight: "100vh",
    backgroundColor: "#F8F9FB",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "8rem", // Gives space so the last item isn't hidden by the fixed bottom bar
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: "border-box"
  }}
>
  <main
    style={{
      flex: "1 1 auto",
      width: "100%",
      maxWidth: "672px", // max-w-2xl
      margin: "0 auto",
      padding: "1.5rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      boxSizing: "border-box"
    }}
  >
    {/* Header Section */}
    <section style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "700",
          color: "#111827",
          margin: 0
        }}
      >
        Subscribe to Contributor ({contributor?.username})
      </h1>

      <div
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          margin: 0
        }}
      >
        {contributor?.username || "Creator"}
      </div>

      <p
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          margin: 0
        }}
      >
        Choose ongoing courses to include in your monthly plan.
      </p>
    </section>

    {/* Courses List */}
    <section style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {courses.map((course) => {
        const priceData = course.price ? JSON.parse(course.price) : null;
        const isFree = priceData?.isFree;
        const amount = priceData?.amount;
        const currency = priceData?.currency || "₦";

        return (
          <div
            key={course.id}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {/* Image & Price Banner */}
            <div
              style={{
                position: "relative",
                height: "144px", // h-36
                width: "100%"
              }}
            >
              <Image
                src={course.thumbnailUrl || deskImg.src}
                alt={course.title}
                fill
                style={{ objectFit: "cover" }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  padding: "8px 12px",
                  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                  color: "#ffffff",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.25rem"
                }}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: "600" }}>
                  {isFree ? "Free" : `${currency}${amount}`}
                </div>

                {!isFree && (
                  <div style={{ fontSize: "10px", opacity: 0.8 }}>
                    per month
                  </div>
                )}
              </div>
            </div>

            {/* Course Details */}
            <div
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}
            >
              <div>
                <p style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500", margin: "0 0 0.25rem 0" }}>
                  {course.code} • {course.session}
                </p>

                <h3 style={{ fontSize: "0.875rem", fontWeight: "600", color: "#111827", margin: "0 0 0.25rem 0" }}>
                  {course.title}
                </h3>

                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                  {course.university}
                </p>
              </div>

              {/* Description with Webkit Line Clamp */}
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.5
                }}
              >
                {course.description}
              </p>

              {/* Toggle Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: "0.75rem",
                  marginTop: "0.25rem"
                }}
              >
                <span style={{ fontSize: "0.875rem", color: "#4b5563", fontWeight: "500" }}>
                  Include
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={course.included}
                  onClick={() => toggleCourse(course.id)}
                  style={{
                    position: "relative",
                    width: 42,
                    height: 24,
                    borderRadius: 999,
                    backgroundColor: course.included ? BRAND_BLUE : "#E5E7EB",
                    transition: "background-color 0.25s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: 2,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      transform: course.included ? "translateX(18px)" : "translateX(0px)",
                      transition: "transform 0.25s ease",
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  </main>

  {/* Fixed Bottom Bar */}
  <div
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#ffffff",
      borderTop: "1px solid #e5e7eb",
      padding: "1rem",
      boxSizing: "border-box",
      zIndex: 50,
      boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.05)"
    }}
  >
    <div
      style={{
        width: "100%",
        maxWidth: "672px", // max-w-2xl to match the container above
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: "500" }}>
          Monthly Total
        </span>

        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: BRAND_BLUE
          }}
        >
          ₦{monthlyTotal.toLocaleString()}
        </span>
      </div>

      <button
        disabled={!hasSelectedCourses}
        onClick={handleProceed}
        style={{
          width: "100%",
          padding: "0.875rem",
          borderRadius: "12px",
          fontWeight: "600",
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          backgroundColor: hasSelectedCourses ? BRAND_BLUE : "#f3f4f6",
          color: hasSelectedCourses ? "#ffffff" : "#9ca3af",
          cursor: hasSelectedCourses ? "pointer" : "not-allowed",
          border: "none",
          transition: "all 0.2s ease-in-out",
        }}
      >
        Proceed to Payment
        <ArrowRight size={18} />
      </button>
    </div>
  </div>
</div>
  );
}