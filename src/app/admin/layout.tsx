"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth as any);
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated || user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, isInitialized, router]);

  if (!isInitialized || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center gap-4 flex-col">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
        <span className="font-bold text-lg tracking-tight">Admin</span>
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0" aria-describedby={undefined}>
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <AdminSidebar onNavigate={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">{children}</main>
    </div>
  );
}
