import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { defaultTheme } from "@/config/theme.config";

import { Toaster } from "sonner";

import { DM_Sans, Inter, Playfair_Display } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Buver | Daily Winds For Colors",
  description: "Premium single-vendor storefront for women's fashion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO: resolve real tenant theme server-side (Supabase) once white-label is wired up
  const tenant = { ...defaultTheme, logoUrl: "/images/app-icon/buver-logo.png", storeName: "Buver" };

  return (
    <html lang="en" suppressHydrationWarning className={`${dmSans.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-foreground bg-background">
        <ThemeProvider tenant={tenant}>
          <Providers>
            {children}
            <Toaster position="top-right" richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
