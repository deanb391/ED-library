import { fetchCourseById } from "@/lib/courses";
import CourseDetailsClient from "./CourseDetailsClient";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const course = await fetchCourseById(params.slug);

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
      title: course.title,
      description: course.description,
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

export default function Page({ params }: { params: { slug: string } }) {
  return <CourseDetailsClient courseId={params.slug} />;
}