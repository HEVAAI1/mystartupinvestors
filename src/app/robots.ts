import { SITE_URL } from "@/lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",          // allow everything important
          "/blog",      // explicitly allow blog
        ],
        disallow: [
          "/dashboard",
          "/admin",
          "/api",
          "/auth",
          "/add-startup",
          "/investor-profile",
          "/startup-details",
          "/view-startup",
          "/payment-success",
          "/payment-failure",
          "/_next",     // block Next internals
        ],
      },

      // ✅ Explicitly allow AI crawlers (GEO)
      {
        userAgent: [
          "GPTBot",        // ChatGPT
          "Google-Extended", // Gemini / Google AI
          "PerplexityBot", // Perplexity
          "ClaudeBot",     // Anthropic
          "CCBot",         // Common Crawl (used by many LLMs)
        ],
        allow: "/",
      },
    ],

    sitemap: `${SITE_URL}/sitemap.xml`,

    host: SITE_URL,
  };
}