import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const ISSERVER = typeof window === "undefined";

const getLocalCart = () => {
  if (ISSERVER) return [];
  try {
    const data = localStorage.getItem("local_cart");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: any[]) => {
  if (ISSERVER) return;
  localStorage.setItem("local_cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: getLocalCart(), loading: false },
  reducers: {
    hydrateCart: (state) => {
      state.items = getLocalCart();
    },
    addToCart: (state, action: PayloadAction<{ variant_id: number; quantity: number; variant: any }>) => {
      const { variant_id, quantity, variant } = action.payload;
      const existingItem = state.items.find((item: any) => item.variant_id === variant_id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: Date.now(), // Generate a temporary ID
          variant_id,
          quantity,
          variants: variant, // frontend expects "variants" holding the variant details
        });
      }
      saveLocalCart(state.items);
    },
    updateCartQty: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find((i: any) => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        saveLocalCart(state.items);
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i: any) => i.id !== action.payload);
      saveLocalCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveLocalCart(state.items);
    },
  },
});

export const { hydrateCart, addToCart, updateCartQty, removeFromCart, clearCart } = cartSlice.actions;

// Keep these names so components don't break immediately, but they are now sync actions
export const fetchCart = () => hydrateCart();

export default cartSlice.reducer;
