import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { db } from "../db/appDB";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
/*
name: "Chai",
    amount: 0,
    category: "Food",
    paymentMethod: "GPAY UPI",
    typeTransaction: "debit",
*/

const HomeScreen = () => {
  const navigate = useNavigate();
  const categories = [
    { name: "Food" },
    { name: "Travel" },
    { name: "Bills" },
    { name: "Shopping" },
    { name: "Salary" },
    { name: "Rapido" },
  ];
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tx = await db.transactions.toArray();
        console.log("Loaded transactions:", tx);
        if (mounted) setAllTransactions(tx);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalExpense = useLiveQuery(async () => {
    const expenses = await db.transactions
      .where("type")
      .equals("Expense")
      .toArray();
    console.log(expenses);
    console.log(
      "Calculating total expense from transactions:",
      expenses.reduce((sum, t) => sum + t.amount, 0),
    );

    return expenses.reduce((sum, t) => sum + t.amount, 0);
  }, []);
  const totalIncome = useLiveQuery(async () => {
    const income = await db.transactions
      .where("type")
      .equals("Income")
      .toArray();
    console.log(income);
    return income.reduce((sum, t) => sum + t.amount, 0);
  }, []);
  const transactionLen = useLiveQuery(async () => {
    const transactions = await db.transactions.toArray();
    console.log(transactions);
    return transactions.length;
  }, []);
  const totalBalance = totalIncome - totalExpense;
  const transactions = useSelector((state) => state.transactions);

  const addTransaction = () => {
    navigate("/addtransaction");
    // Here you would typically open a modal or navigate to a form to add a transaction
  };

  return (
    <>
      <div className="bg-[#121212] text-amber-50 w-full min-h-screen p-4">
        <h1>Total Expense:₹{totalExpense || 0}</h1>
        <h1>Total Income:₹{totalIncome || 0}</h1>
        <h1>Total Balance:₹{totalBalance || 0}</h1>
        <p>{transactionLen} transactions found</p>
        <ul>
          {allTransactions.map((t) => (
            <li key={t.id}>
              {t.subcategoryName} - ₹{t.amount} -{" "}
              {categories[t.categoryId - 1].name} - {t.paymentMethod} - {t.type}
            </li>
          ))}
        </ul>
        <button
          onClick={addTransaction}
          className="bg-blue-900 text-white py-2 px-4 rounded"
        >
          Add Transaction
        </button>
      </div>
    </>
  );
};

export default HomeScreen;
