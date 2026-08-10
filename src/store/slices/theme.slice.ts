import { createSlice } from "@reduxjs/toolkit";
import { defaultTheme } from "@/config/theme.config";

const themeSlice = createSlice({
  name: "theme",
  initialState: { ...defaultTheme, logoUrl: "", storeName: "" },
  reducers: {
    setTheme: (state, action) => ({ ...state, ...action.payload }),
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
