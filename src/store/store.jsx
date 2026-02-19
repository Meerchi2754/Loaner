import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import transactionReducer from "../features/dataSlice";
import categoryReducer from "../features/categorySlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    transaction: transactionReducer,
    category: categoryReducer,
  },
});
