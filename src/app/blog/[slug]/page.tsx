import { fetchSanityPost } from "@/lib/sanity";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import BlogPostClient from "./BlogPostClient";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

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
      url: `/blog/${slug}`,
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
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await fetchSanityPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.brief,
    datePublished: post.publishedAt,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: SITE_NAME },
    image: post.coverImage?.url,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
  };

  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}