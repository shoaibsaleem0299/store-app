"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth as any);
  const router = useRouter();

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
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
