import { getContributorService } from "@/lib/api/contributors";
import CreatorProfileClient from "./CreatorProfileClient";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const contributor = await getContributorService(slug);

  if (!contributor) {
    return {
      title: "Contributor Not Found",
      description: "This contributor does not exist.",
    };
  }

  const followers = contributor.followers || 0
  const profileImage = contributor.profileImage || ""

  return {
    title: `${contributor.username} | ED Library`,
    description: contributor.bio || "Contributor on ED-Library platform.",
    openGraph: {
      title: `${contributor.username} - ${followers} ${ followers > 1 ? "followers" : "follower"}`,
      description: contributor.bio || "Explore courses by this contributor.",
      url: `https://www.ed-library.app/contributor/account/${slug}`,
      siteName: "ED Library",
      type: "profile",
      ...(profileImage && {
        images: [
          {
            url: profileImage,
            width: 1200,
            height: 1200,
            alt: contributor.username,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${contributor.username} | ED Library`,
      description: contributor.bio || "Explore courses by this contributor.",
      ...(profileImage && { images: [profileImage] }),
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CreatorProfileClient slug={slug} />;
}