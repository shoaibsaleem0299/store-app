"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { authService } from "@/services/auth.service";
import { logout } from "@/store/slices/auth.slice";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/features/storefront/CartDrawer";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, LogOut, LayoutDashboard, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";

export function StorefrontNav() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      dispatch(logout());
      toast.success("Successfully logged out!");
    } catch (err: any) {
      toast.error("Failed to log out.");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight">
          <img src="/images/logo.svg" alt="logo" className="w-8 h-8 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">StoreApp</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9 bg-secondary border-border" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="icon" className="hover:bg-secondary" title="Admin Dashboard">
                    <LayoutDashboard className="w-5 h-5 text-foreground" />
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs uppercase">
                        {user.fullName?.slice(0, 2) || user.email?.slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background border border-border" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-foreground">{user.fullName || "User"}</p>
                      <p className="text-xs text-muted-foreground font-semibold truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-border" />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Order History</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard" className="flex items-center cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="border-border" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-bold">Sign up</Button>
              </Link>
            </div>
          )}

          <div className="border-l border-border h-6 pl-4 flex items-center">
            <CartDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
