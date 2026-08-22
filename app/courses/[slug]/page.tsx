import { fetchCourseByIdService } from "@/lib/services/course.service";
import CourseDetailsClient from "./CourseDetailsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await fetchCourseByIdService(slug);

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
      description: `${course.department} - ${course.level}lvl - ${course.session} - ${course.description} `,
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