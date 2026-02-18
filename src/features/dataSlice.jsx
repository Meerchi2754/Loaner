import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  budget: 15000,
};

export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setBudget: (state, action) => {
      state.budget = action.payload.budget;
    },
  },
});

export const { setBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
