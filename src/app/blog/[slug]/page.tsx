import { fetchHashnodePost } from "@/lib/hashnode";
import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";

export const revalidate = 3600;

interface BlogPostPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: BlogPostPageProps) {
    const post = await fetchHashnodePost(params.slug);

    if (!post) {
        return {
            title: "Post Not Found – MyFundingList Blog",
            description: "The requested blog post could not be found.",
        };
    }

    return {
        title: `${post.title} – MyFundingList Blog`,
        description: post.brief,
        alternates: {
            canonical: `https://myfundinglist.com/blog/${params.slug}`,
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const post = await fetchHashnodePost(params.slug);

    if (!post) {
        notFound();
    }

    return <BlogPostClient post={post} />;
}
