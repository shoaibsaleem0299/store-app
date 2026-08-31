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
import { Search, LogOut, LayoutDashboard, ShoppingBag, User } from "lucide-react";

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

  const navLinks = [
    { name: "SUITS", href: "/category/suits" },
    { name: "SCARVES", href: "/category/scarves" },
    { name: "DUPATTAS", href: "/category/dupattas" },
    { name: "NEW", href: "/new" },
    { name: "SALE", href: "/sale" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-transparent transition-all duration-300">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="w-1/4 flex items-center">
          <Link href="/" className="font-serif font-bold text-3xl tracking-tight text-foreground">
            Buver
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex flex-1 justify-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="w-1/4 flex items-center justify-end gap-5">
          <button className="text-foreground hover:opacity-70 transition-opacity">
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="text-foreground hover:opacity-70 transition-opacity">
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </div>
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
                  <Link href="/orders" className="flex items-center cursor-pointer font-medium text-sm">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="flex items-center cursor-pointer font-medium text-sm">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="border-border" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 cursor-pointer font-medium text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" className="text-foreground hover:opacity-70 transition-opacity">
               <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          )}

          {user?.role !== "admin" && (
            <div className="flex items-center relative">
              <CartDrawer />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
