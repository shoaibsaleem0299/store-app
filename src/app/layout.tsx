import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { defaultTheme } from "@/config/theme.config";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "My Store",
  description: "Single-vendor storefront",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO: resolve real tenant theme server-side (Supabase) once white-label is wired up
  const tenant = { ...defaultTheme, logoUrl: "/images/logo.svg", storeName: "My Store" };

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
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
