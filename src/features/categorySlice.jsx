import { createSlice } from "@reduxjs/toolkit";
import { defaultCategories } from "../model/category";

const initialState = {
  transactions: [],
  categories: [...defaultCategories], // Default categories are initialized here
  budget: 0,
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      state.transactions.push(action.payload);
    },
    resetTransactions: (state) => {
      state.transactions = [];
    },
    setBudget: (state, action) => {
      state.budget = action.payload;
    },
    addCategories: (state, action) => {
      //const newCategories = Array.isArray(action.payload) ? action.payload : [];
      state.categories.push(action.payload);
    },
  },
});

export const { addTransaction, resetTransactions, setBudget, addCategories } =
  transactionSlice.actions;

export default transactionSlice.reducer;
