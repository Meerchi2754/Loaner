import React, { useMemo, useState, useEffect } from "react";
import { db } from "../db/appDB";
import { useLiveQuery } from "dexie-react-hooks";
import BottomNav from "../component/BottomNav";
import { defaultCategories } from "../model/category";
import { useSelector } from "react-redux";

const TransactionHistory = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [jsonTransactions, setJsonTransactions] = useState([]);

  /* -------------------- LIVE DEXIE DATA -------------------- */
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const categories = useSelector((state) => state.category.categories || []);

  const safeTransactions = transactions ?? [];
  const safeCategories =
    categories && categories.length > 0 ? categories : defaultCategories;

  /* -------------------- LOAD JSON FOR OLD MONTH -------------------- */
  useEffect(() => {
    const loadPreviousMonthData = async () => {
      if (selectedMonth === currentMonth) {
        setJsonTransactions([]);
        return;
      }

      try {
        const monthString = String(selectedMonth).padStart(2, "0");

        // IMPORTANT: JSON must be inside public/Data/
        const response = await fetch(
          `/Data/${currentYear}-${monthString}.json`,
        );

        if (!response.ok) throw new Error("No JSON file found");

        const data = await response.json();
        setJsonTransactions(data);
      } catch (error) {
        console.log("No JSON file available for this month");
        setJsonTransactions([]);
      }
    };

    loadPreviousMonthData();
  }, [selectedMonth, currentMonth, currentYear]);

  /* -------------------- CATEGORY MAP (FIXED ICON BUG) -------------------- */
  const categoryMap = useMemo(() => {
    const map = {};
    safeCategories.forEach((cat) => {
      map[String(cat.id)] = cat; // Normalize key as string
    });
    return map;
  }, [safeCategories]);

  const getCategory = (categoryId) => {
    return categoryMap[String(categoryId)] || null;
  };

  /* -------------------- FILTER TRANSACTIONS -------------------- */
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === currentMonth) {
      return safeTransactions.filter((tx) => {
        const txDate = new Date(tx.date || tx.createdAt);
        return (
          txDate.getMonth() + 1 === selectedMonth &&
          txDate.getFullYear() === currentYear
        );
      });
    }

    return jsonTransactions;
  }, [
    safeTransactions,
    jsonTransactions,
    selectedMonth,
    currentMonth,
    currentYear,
  ]);

  /* -------------------- TOTALS -------------------- */
  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === "Expense")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === "Income")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, [filteredTransactions]);

  /* -------------------- GROUP BY DATE -------------------- */
  const groupedByDate = useMemo(() => {
    const groups = {};
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    for (const tx of filteredTransactions) {
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

    // Sort each group by time (descending)
    Object.values(groups).forEach((arr) =>
      arr.sort((a, b) => {
        const ta = (a.time ?? "00:00").replace(":", "");
        const tb = (b.time ?? "00:00").replace(":", "");
        return Number(tb) - Number(ta);
      }),
    );

    const otherKeys = Object.keys(groups).filter(
      (k) => k !== "Today" && k !== "Yesterday",
    );

    otherKeys.sort((a, b) => b.localeCompare(a));

    const orderedKeys = [];
    if (groups["Today"]) orderedKeys.push("Today");
    if (groups["Yesterday"]) orderedKeys.push("Yesterday");
    orderedKeys.push(...otherKeys);

    return { groups, orderedKeys };
  }, [filteredTransactions]);

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  return (
    <div className="bg-[#121212] text-white p-4 pt-6 shadow-lg pb-10 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transaction History</h2>

        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="bg-gray-800 text-white p-2 rounded-lg"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Totals */}
      <div className="flex justify-between items-center bg-linear-to-br from-white/10 via-white/5 to-white/10 p-4 rounded-lg shadow-md mb-4">
        <div>
          <p className="text-sm text-gray-400">Total Income</p>
          <p className="text-lg font-bold text-green-400">
            ₹{totalIncome.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Total Expense</p>
          <p className="text-lg font-bold text-red-400">
            ₹{totalExpense.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      {groupedByDate.orderedKeys.length === 0 ? (
        <p className="text-center text-gray-400">No transactions found</p>
      ) : (
        groupedByDate.orderedKeys.map((label) => (
          <div key={label} className="mb-6">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">
              {label}
            </h3>

            <ul className="space-y-4">
              {groupedByDate.groups[label].map((t, index) => {
                const category = getCategory(t.categoryId);

                return (
                  <li
                    key={t.id ?? index}
                    className="flex items-center justify-between rounded-2xl shadow-lg bg-gray-800 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700">
                        <span className="text-xl text-white">
                          {category?.icon ?? "📦"}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {t.subcategoryName}
                        </p>

                        <p className="text-xs text-gray-400">
                          {category?.name ?? "Unknown"} •{" "}
                          {t.paymentMethod ?? "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          t.type === "Income"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {t.type === "Income" ? "+" : "-"}₹
                        {Number(t.amount || 0).toFixed(2)}
                      </p>

                      <p className="text-xs text-gray-400">{t.time ?? "N/A"}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}

      <BottomNav />
    </div>
  );
};

export default TransactionHistory;
