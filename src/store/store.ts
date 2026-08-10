import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import cartReducer from "./slices/cart.slice";
import productReducer from "./slices/product.slice";
import themeReducer from "./slices/theme.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
