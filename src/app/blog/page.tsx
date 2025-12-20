import { fetchHashnodePosts } from "@/lib/hashnode";
import BlogClient from "./BlogClient";

export const metadata = {
    title: "Blog – MyFundingList",
    description: "Insights, updates, and resources for startup founders and investors",
};

export const revalidate = 3600;

export default async function BlogPage() {
    const posts = await fetchHashnodePosts();

    return <BlogClient initialPosts={posts} />;
}
