import { fetchSanityPosts } from "@/lib/sanity";
import { tools } from "@/lib/tools";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap() {
  const baseUrl = SITE_URL;

  // Blogs
  const posts = await fetchSanityPosts();

  const blogPostUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
  }));

  // Tools (AUTO)
  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}${tool.route}`,
    lastModified: new Date(),
  }));

  return [
    // Core
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    { url: `${baseUrl}/affiliate`, lastModified: new Date() },

    // Tools hub
    { url: `${baseUrl}/tools-for-founders`, lastModified: new Date() },

    // Legal
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/refund`, lastModified: new Date() },

    // Dynamic
    ...blogPostUrls,
    ...toolUrls,
  ];
}