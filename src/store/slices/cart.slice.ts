import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { cartService } from "@/services-client/cart.service";

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  return await cartService.list();
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async (payload: { variant_id: number; quantity: number }, { dispatch }) => {
    await cartService.create(payload);
    dispatch(fetchCart());
  }
);

export const updateCartQty = createAsyncThunk(
  "cart/updateQty",
  async (payload: { id: number; quantity: number }, { dispatch }) => {
    await cartService.update(payload.id, { quantity: payload.quantity });
    dispatch(fetchCart());
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (id: number, { dispatch }) => {
    await cartService.remove(id);
    dispatch(fetchCart());
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as any[], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action: any) => {
        state.items = action.payload || [];
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default cartSlice.reducer;
