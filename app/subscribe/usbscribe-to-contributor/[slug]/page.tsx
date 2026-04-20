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
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col pb-32">
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Subscribe to Contributor ({contributor?.username})
          </h1>

          <div className="text-sm text-gray-500">
            {contributor?.username || "Creator"}
          </div>

          <p className="text-sm text-gray-500">
            Choose ongoing courses to include in your monthly plan.
          </p>
        </section>

        <section className="space-y-4">
          {courses.map((course) => {
            const priceData = course.price
              ? JSON.parse(course.price)
              : null;

            const isFree = priceData?.isFree;
            const amount = priceData?.amount;
            const currency = priceData?.currency || "₦";

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                style={{ marginBottom: 20 }}
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={course.thumbnailUrl || deskImg.src}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />

                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      padding: "8px 12px",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                      color: "#fff",
                    }}
                  >
                    <div className="text-sm font-semibold">
                      {isFree ? "Free" : `${currency}${amount}`}
                    </div>

                    {!isFree && (
                      <div className="text-[10px] opacity-80">
                        per month
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {course.code} • {course.session}
                      </p>

                      <h3 className="text-sm font-semibold text-gray-900">
                        {course.title}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {course.university}
                      </p>
                    </div>
                  </div>

                  <p
                    className="text-xs text-gray-500 line-clamp-2"
                    style={{ marginTop: 5 }}
                  >
                    {course.description}
                  </p>

                  <div
                    className="flex items-center justify-between border-t border-gray-100"
                    style={{ marginTop: 10, paddingTop: 8 }}
                  >
                    <span className="text-sm text-gray-600">
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
                        backgroundColor: course.included
                          ? BRAND_BLUE
                          : "#E5E7EB",
                        transition: "background-color 0.25s ease",
                        display: "inline-flex",
                        alignItems: "center",
                        padding: 2,
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          transform: course.included
                            ? "translateX(18px)"
                            : "translateX(0px)",
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

      <div className="bottom-0 w-full bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between mb-3">
            <span className="text-sm text-gray-500">
              Monthly Total
            </span>

            <span
              className="text-xl font-bold"
              style={{ color: BRAND_BLUE }}
            >
              ₦{monthlyTotal.toLocaleString()}
            </span>
          </div>

          <button
            disabled={!hasSelectedCourses}
            onClick={handleProceed}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            style={{
              backgroundColor: hasSelectedCourses
                ? BRAND_BLUE
                : "#D1D5DB",
              color: hasSelectedCourses ? "#fff" : "#6B7280",
              cursor: hasSelectedCourses ? "pointer" : "not-allowed",
              opacity: hasSelectedCourses ? 1 : 0.8,
            }}
          >
            Proceed to Payment
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}