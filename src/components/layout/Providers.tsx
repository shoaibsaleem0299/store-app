"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";
import { authService } from "@/services/auth.service";
import { setUser } from "@/store/slices/auth.slice";
import { fetchCart } from "@/store/slices/cart.slice";
import type { AppDispatch } from "@/store/store";

function AuthListener({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // 1. Get initial session/user
    authService.getCurrentUser().then((user) => {
      if (user) {
        dispatch(setUser({
          id: user.id,
          email: user.email,
          role: user.role || "customer",
          fullName: (user as any).fullName || "",
        }));
        dispatch(fetchCart());
      } else {
        dispatch(setUser(null));
      }
    });
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthListener>{children}</AuthListener>
    </Provider>
  );
}
