import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://buver.vercel.app";

  try {
    // Fetch all active products
    const products = await prisma.product.findMany({
      where: { status: "active" },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const productUrls = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Add static routes
    const routes = ["", "/products"].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    }));

    return [...routes, ...productUrls];
  } catch (error) {
    console.error("Failed to generate sitemap", error);
    // Return fallback static routes if DB connection fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
    ];
  }
}
