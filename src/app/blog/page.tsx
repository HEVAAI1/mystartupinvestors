import { fetchSanityPosts } from "@/lib/sanity";
import BlogClient from "./BlogClient";

export const metadata = {
    title: "Blog",
    description: "Insights, updates, and resources for startup founders and investors",
};

export const revalidate = 3600;

export default async function BlogPage() {
    const posts = await fetchSanityPosts();

    return <BlogClient initialPosts={posts} />;
}
