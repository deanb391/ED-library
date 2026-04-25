import { fetchCourseById } from "@/lib/courses";
import CourseDetailsClient from "./CourseDetailsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await fetchCourseById(slug);

  if (!course) {
    return {
      title: "Course Not Found",
      description: "This course does not exist.",
    };
  }

  return {
    title: `${course.title} | ED Library`,
    description: course.description,
    openGraph: {
      title: `${course.code} - ${course.title}`,
      description: `${course.description} - ${course.department} - ${course.level} - ${course.session}`,
      images: [
        {
          url: course.thumbnailUrl,
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CourseDetailsClient courseId={slug} />;
}