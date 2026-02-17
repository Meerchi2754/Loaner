import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transaction: {
    name: "Chai",
    amount: 0,
    category: "Food",
    paymentMethod: "GPAY UPI",
    typeTransaction: "debit",
  },
};

export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    addtoTransaction: (state, action) => {
      state.transaction = {
        name: action.payload.name,
        amount: action.payload.amount,
        category: action.payload.category,
        paymentMethod: action.payload.paymentMethod,
        typeTransaction: action.payload.typeTransaction,
      };
    },
  },
});

export const { addtoTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
