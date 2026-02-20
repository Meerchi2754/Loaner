import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transactions: [],
  categories: [], // ✅ ALWAYS plain array
  budget: 0,
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    addCategory: (state, action) => {
      state.categories.push(action.payload);
    },
    addTransaction: (state, action) => {
      state.transactions.push(action.payload);
    },
    resetTransactions: (state) => {
      state.transactions = [];
    },
    setBudget: (state, action) => {
      state.budget = action.payload;
    },
  },
});

export const {
  setCategories,
  addCategory,
  addTransaction,
  resetTransactions,
  setBudget,
} = transactionSlice.actions;

export default transactionSlice.reducer;
