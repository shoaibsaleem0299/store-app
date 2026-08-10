import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { productService } from "@/services-client/product.service";

export const fetchProducts = createAsyncThunk("products/fetch", async (params: any) => {
  return await productService.list(params);
});

const productSlice = createSlice({
  name: "product",
  initialState: { items: [] as any[], meta: {}, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action: any) => {
        state.items = action.payload.data;
        state.meta = action.payload.meta;
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
