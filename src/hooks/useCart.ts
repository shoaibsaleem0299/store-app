import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCart } from "@/store/slices/cart.slice";
import { useEffect } from "react";

export function useCart() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return { items, loading };
}
