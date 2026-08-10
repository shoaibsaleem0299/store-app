import { StorefrontNav } from "@/components/layout/StorefrontNav";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <StorefrontNav />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground bg-card">
        &copy; {new Date().getFullYear()} StoreApp. All rights reserved.
      </footer>
    </div>
  );
}
