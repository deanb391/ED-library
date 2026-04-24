import EDLibraryHome from "./HomeScreen";

export const metadata = {
  title: "ED Library – Learn Smarter, Faster",
  description:
    "Explore structured courses, lecture notes, and top contributors across your field.",
  openGraph: {
    title: "ED Library – Learn Smarter, Faster",
    description:
      "Explore structured courses, lecture notes, and top contributors across your field.",
    url: "https://www.ed-library.app/",
    siteName: "ED Library",
    images: [
      {
        url: "https://ed-library-bucket.s3.us-east-1.amazonaws.com/ads/images/daa54a81-425f-43b2-ac84-e4c4db919f72.mp4",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ED Library – Learn Smarter, Faster",
    description:
      "Explore structured courses, lecture notes, and top contributors.",
    images: ["https://ed-library-bucket.s3.us-east-1.amazonaws.com/ads/images/daa54a81-425f-43b2-ac84-e4c4db919f72.mp4"],
  },
};

export default function Page() {
  return <EDLibraryHome />;
}