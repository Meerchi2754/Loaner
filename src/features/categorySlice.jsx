import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transactions: [], // ✅ ALWAYS plain array
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
  },
});

export const { addTransaction, resetTransactions, setBudget } =
  transactionSlice.actions;

export default transactionSlice.reducer;
