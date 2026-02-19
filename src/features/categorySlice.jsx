import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { id: 1, name: "Food", icon: "🍔" },
  { id: 2, name: "Travel", icon: "🚗" },
  { id: 3, name: "Bills", icon: "💡" },
  { id: 4, name: "Shopping", icon: "🛒" },
  { id: 5, name: "Salary", icon: "💰" },
  { id: 6, name: "Rapido", icon: "🏍️" },
];

export const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    addcategory: (state, action) => {
      state.push(...action.payload);
    },
  },
});

export const { addcategory } = categorySlice.reducer;
export default categorySlice.reducer;
