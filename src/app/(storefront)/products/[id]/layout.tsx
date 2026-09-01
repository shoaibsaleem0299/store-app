import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: BigInt(id) },
    });

    if (!product) {
      return {
        title: "Product Not Found",
        description: "This product is unavailable or does not exist.",
      };
    }

    // Safely extract the first image or a default fallback
    let imageUrl = "/images/app-icon/buver-logo.png";
    const baseImages = product.baseImages as any;
    if (Array.isArray(baseImages) && baseImages.length > 0 && typeof baseImages[0] === "string") {
      imageUrl = baseImages[0];
    }

    return {
      title: product.name,
      description: product.description || `Buy ${product.name} at Buver. Premium single-vendor storefront for women's fashion.`,
      openGraph: {
        title: product.name,
        description: product.description || `Buy ${product.name} at Buver. Premium single-vendor storefront for women's fashion.`,
        images: [{ url: imageUrl }],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description || `Buy ${product.name} at Buver. Premium single-vendor storefront for women's fashion.`,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "Product",
      description: "Premium single-vendor storefront for women's fashion",
    };
  }
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
