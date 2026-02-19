import React, { use, useMemo, useState, useEffect } from "react";
import { db } from "../db/appDB";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const HistoryTransaction = ({ categories, allTransactions }) => {
  const reduxCategories = useSelector((state) => state.category);
  const finalCategories = categories || reduxCategories;
  const [fetchedTransactions, setFetchedTransactions] = useState([]);
  const finalAllTransactions = allTransactions || fetchedTransactions;
  const navigate = useNavigate();
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

  const transactionLen = finalAllTransactions.length;
  // group transactions by date label: Today, Yesterday, or YYYY-MM-DD
  const groupedByDate = useMemo(() => {
    const groups = {};
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    for (const tx of finalAllTransactions) {
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

    Object.keys(groups).forEach((key) => {
      groups[key] = groups[key].slice(0, 2);
    });

    const orderedKeys = [];
    if (groups["Today"]) orderedKeys.push("Today");
    if (groups["Yesterday"]) orderedKeys.push("Yesterday");
    orderedKeys.push(...otherKeys);

    return { groups, orderedKeys };
  }, [allTransactions]);

  return (
    <>
      <div className=" text-white p-4 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <button
            className="text-blue-500 hover:underline"
            onClick={() => {
              navigate("/transactionspath");
            }}
          >
            View All
          </button>
        </div>

        {groupedByDate.orderedKeys.length === 0 ? (
          <p>No transactions yet</p>
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
                    className="flex items-center justify-between rounded-2xl shadow-lg bg-linear-to-br from-white/10 via-white/5 to-white/10 p-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-700`}
                      >
                        <span className="text-xl text-white">
                          {categories.find((c) => c.id === t.categoryId)
                            ?.icon ?? "🍔"}
                        </span>
                      </div>

                      {/* Transaction Details */}
                      <div>
                        <p className="text-sm font-semibold">
                          {t.subcategoryName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {categories.find((c) => c.id === t.categoryId)
                            ?.name ?? `Category ${t.categoryId ?? "?"}`}{" "}
                          • {t.paymentMethod}
                        </p>
                      </div>
                    </div>

                    {/* Amount and Time */}
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          t.type === "Income"
                            ? "text-green-400"
                            : "text-red-400"
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
    </>
  );
};

export default HistoryTransaction;
