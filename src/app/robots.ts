export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/dashboard",
                    "/admin",
                    "/api",
                    "/auth",
                ],
            },
        ],
        sitemap: "https://myfundinglist.com/sitemap.xml",
    };
}
