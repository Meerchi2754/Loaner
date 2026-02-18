import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { db } from "../db/appDB";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import Navbar from "./HeaderNav";
import StatsCards from "./StatsCard";

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

  const budget = useSelector((state) => state.transaction.budget);
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

  // total expense calculation
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

  // total income calculation
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

  //const transactions = useSelector((state) => state.transactions);

  // group transactions by date label: Today, Yesterday, or YYYY-MM-DD
  const groupedByDate = useMemo(() => {
    const groups = {};
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    for (const tx of allTransactions) {
      // prefer explicit date field, fallback to createdAt slice if present
      const txDate =
        tx.date ?? (tx.createdAt ? tx.createdAt.slice(0, 10) : today);
      const label =
        txDate === today
          ? "Today"
          : txDate === yesterday
            ? "Yesterday"
            : txDate;

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    }

    // sort transactions inside each group by time (optional) descending
    Object.values(groups).forEach((arr) =>
      arr.sort((a, b) => {
        const ta = (a.time ?? "00:00").replace(":", "");
        const tb = (b.time ?? "00:00").replace(":", "");
        return Number(tb) - Number(ta);
      }),
    );

    // produce ordered keys: Today, Yesterday, then by date desc
    const otherKeys = Object.keys(groups).filter(
      (k) => k !== "Today" && k !== "Yesterday",
    );
    otherKeys.sort((a, b) => b.localeCompare(a)); // "YYYY-MM-DD" string compare works for ISO

    const orderedKeys = [];
    if (groups["Today"]) orderedKeys.push("Today");
    if (groups["Yesterday"]) orderedKeys.push("Yesterday");
    orderedKeys.push(...otherKeys);

    return { groups, orderedKeys };
  }, [allTransactions]);

  const categoryTotal = useMemo(() => {
    return allTransactions.reduce((acc, tx) => {
      const catName =
        categories[tx.categoryId - 1]?.name ??
        `Category ${tx.categoryId ?? "?"}`;
      acc[catName] = (acc[catName] || 0) + Number(tx.amount || 0);
      return acc;
    }, {});
  }, [allTransactions]);

  const addTransaction = () => {
    navigate("/addtransaction");
  };
  return (
    <>
      <div className="bg-[#121212] text-amber-50 w-full min-h-screen p-4">
        <Navbar totalBalance={totalBalance} budget={budget} />
        <StatsCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          budget={budget}
        />
        <h1>Total Balance:₹{totalBalance || 0}</h1>
        <h1>Budget:₹{budget || 0}</h1>
        <h1>Remaining Budget:₹{(budget || 0) - (totalExpense || 0)}</h1>
        <h1>Total Expense:₹{totalExpense || 0}</h1>
        <h1>Total Income:₹{totalIncome || 0}</h1>

        <p>{transactionLen} transactions found</p>

        {/* Grouped transactions by date */}
        {groupedByDate.orderedKeys.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          groupedByDate.orderedKeys.map((label) => (
            <section key={label} className="mb-4">
              <h3 className="text-lg font-semibold">{label}</h3>
              <ul className="pl-4">
                {groupedByDate.groups[label].map((t) => (
                  <li key={t.id} className="py-1">
                    {t.subcategoryName} - ₹{t.amount} -{" "}
                    {categories[t.categoryId - 1]?.name ??
                      `Category ${t.categoryId ?? "?"}`}{" "}
                    - {t.paymentMethod} - {t.type}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <h2>Category Breakdown</h2>
        <ul>
          {Object.entries(categoryTotal).map(([category, total]) => (
            <li key={category}>
              {category}: ₹{total}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate("/addtransaction")}
          className="bg-blue-900 text-white py-2 px-4 rounded"
        >
          Add Transaction
        </button>
      </div>
    </>
  );
};

export default HomeScreen;
