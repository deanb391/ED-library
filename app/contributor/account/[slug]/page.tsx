import { getContributor } from "@/lib/api/contributors";
import CreatorProfileClient from "./CreatorProfileClient";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const contributor = await getContributor(params.slug);

  if (!contributor) {
    return {
      title: "Contributor Not Found",
      description: "This contributor does not exist.",
    };
  }

  return {
    title: `${contributor.username} | ED Library`,
    description: contributor.bio || "Contributor on ED-Library platform.",
    openGraph: {
      title: contributor.username,
      description: contributor.bio || "Explore courses by this contributor.",
      images: [
        {
          url: contributor.profileImage,
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <CreatorProfileClient slug={params.slug} />;
}