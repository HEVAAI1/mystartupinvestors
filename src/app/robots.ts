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

    sitemap: "https://myfundinglist.com/sitemap.xml",

    host: "https://myfundinglist.com",
  };
}