import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/cart/"],
    },
    sitemap: "https://buver.vercel.app/sitemap.xml",
  };
}
