import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "dark",
  password: "2754",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    themeChanger: (state, action) => {
      state.theme = action.payload.theme;
    },
    passwordChanger: (state, action) => {
      state.password = action.payload.password;
    },
  },
});

export const { themeChanger, passwordChanger } = userSlice.actions;
export default userSlice.reducer;
