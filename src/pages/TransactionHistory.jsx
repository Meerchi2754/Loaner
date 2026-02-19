import React, { useMemo, useState, useEffect } from "react";
import { db } from "../db/appDB";
import { useSelector } from "react-redux";

const TransactionHistory = ({ categories = [], allTransactions }) => {
  const reduxCategories = useSelector((state) => state.category);
  const finalCategories = categories.length ? categories : reduxCategories;
  const [fetchedTransactions, setFetchedTransactions] = useState([]);
  const finalAllTransactions = allTransactions || fetchedTransactions;

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (!allTransactions) {
      (async () => {
        try {
          const tx = await db.transactions.toArray();
          setFetchedTransactions(tx);
        } catch (err) {
          console.error("Failed to load transactions:", err);
        }
      })();
    }
  }, [allTransactions]);

  if (!Array.isArray(finalCategories)) {
    return <p>Error: Categories not loaded</p>;
  }

  const filteredTransactions = useMemo(() => {
    return finalAllTransactions.filter((tx) => {
      const txDate = new Date(tx.date || tx.createdAt);
      return txDate.getMonth() + 1 === selectedMonth;
    });
  }, [finalAllTransactions, selectedMonth]);

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

  // HANDLE MONTH CHANGES
  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  return (
    <div className="bg-[#121212] text-white p-4 pt-6 shadow-lg pb-10 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="bg-gray-800 text-white p-2 rounded-lg"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>
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
      {groupedByDate.orderedKeys.length === 0 ? (
        <p className="text-center text-gray-400">No transactions found</p>
      ) : (
        groupedByDate.orderedKeys.map((label) => (
          <div key={label} className="mb-6">
            <h3 className="text-gray-400 text-sm font-semibold mb-2">
              {label}
            </h3>
            <ul className="space-y-4">
              {groupedByDate.groups[label].map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-2xl shadow-lg bg-gray-800 p-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-700`}
                    >
                      <span className="text-xl text-white">
                        {Array.isArray(finalCategories) &&
                        finalCategories.find((c) => c.id === t.categoryId)
                          ? finalCategories.find((c) => c.id === t.categoryId)
                              .icon
                          : "🍔"}
                      </span>
                    </div>

                    {/* Transaction Details */}
                    <div>
                      <p className="text-sm font-semibold">
                        {t.subcategoryName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Array.isArray(finalCategories) &&
                        finalCategories.find((c) => c.id === t.categoryId)
                          ? finalCategories.find((c) => c.id === t.categoryId)
                              .name
                          : `Category ${t.categoryId ?? "?"}`}{" "}
                        • {t.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Amount and Time */}
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        t.type === "Income" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {t.type === "Income" ? "+" : "-"}₹{t.amount}
                    </p>
                    <p className="text-xs text-gray-400">{t.time ?? "N/A"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionHistory;
