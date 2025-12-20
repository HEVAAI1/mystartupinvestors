import { fetchHashnodePosts } from "@/lib/hashnode";

export default async function sitemap() {
    const baseUrl = "https://myfundinglist.com";

    // Fetch blog posts
    const posts = await fetchHashnodePosts();

    const blogPostUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
    }));

    return [
        // Core pages
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
        },

        // Legal pages
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/refund`,
            lastModified: new Date(),
        },

        // Blog posts
        ...blogPostUrls,
    ];
}
