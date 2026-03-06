import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { seedDatabase } from "./db/seed";
import LockScreen from "./component/LockScreen";
import HomeScreen from "./pages/HomeScreen";
import AddTransaction from "./pages/AddTransaction";
import HistoryTransaction from "./component/HistoryTransaction";
import Stats from "./pages/Stats";
import TransactionPage from "./pages/TransactionHistory";
import Settings from "./pages/Settings";
import Budget from "./pages/Budget";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
// import { setCategories } from "./features/categorySlice";
// import { db } from "./db/appDB";

function App() {
  // const dispatch = useDispatch();
  // useEffect(() => {
  //   seedDatabase();
  // }, []);

  // useEffect(() => {
  //   async function loadCategories() {
  //     try {
  //       const data = await db.categories.toArray();
  //       if (!data || data.length === 0) {
  //         toast.error("Categories not loaded");
  //         return;
  //       }
  //       setCategories(data); // Use setCategories to update state
  //     } catch (error) {
  //       console.error("Error loading categories:", error);
  //       toast.error("Failed to load categories.");
  //     }
  //   }

  //   loadCategories();
  // }, []);
  // useEffect(() => {
  //   async function loadCategories() {
  //     const categories = await db.categories.toArray();
  //     dispatch(setCategories(categories));
  //   }

  //   loadCategories();
  // }, []);

  return (
    <div>
      <Routes>
        <Route path="/" element={<LockScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/addtransaction" element={<AddTransaction />} />
        <Route path="/history" element={<HistoryTransaction />} />
        <Route path="/transactionspath" element={<TransactionPage />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
