import { fetchSanityPost } from "@/lib/sanity";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";

export const revalidate = 3600;

// ✅ params is now a Promise in Next 15
interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchSanityPost(slug);

  if (!post) {
    return {
      title: "Post Not Found – MyFundingList Blog",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} – MyFundingList Blog`,
    description: post.brief,
    

    openGraph: {
      title: post.title,
      description: post.brief,
      url: `https://myfundinglist.com/blog/${slug}`,
      images: post.coverImage?.url
        ? [
            {
              url: post.coverImage.url,
              width: 1200,
              height: 630,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.brief,
      images: post.coverImage?.url
        ? [post.coverImage.url]
        : [],
    },

    alternates: {
      canonical: `https://myfundinglist.com/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await fetchSanityPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}