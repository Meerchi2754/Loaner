import React, { useMemo, useState, useEffect } from "react";
import { db } from "../db/appDB";
import { useLiveQuery } from "dexie-react-hooks";
import BottomNav from "../component/BottomNav";
import { defaultCategories } from "../model/category";
import { useSelector } from "react-redux";

// ── Same category color map as Stats.jsx ────────────────────────────────────
const CATEGORY_COLORS = {
  1: "#F97316", // Food
  2: "#60A5FA", // Travel
  11: "#A78BFA", // Petrol
  3: "#FBBF24", // Bills
  4: "#F43F5E", // Shopping
  5: "#34D399", // Salary
  6: "#FB7185", // Rapido
  7: "#94A3B8", // Others
  8: "#38BDF8", // Service
  9: "#22C55E", // Papa
  10: "#E879F9", // Aryan
};

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" }),
);

const fmt = (n) =>
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const TransactionHistory = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [jsonTransactions, setJsonTransactions] = useState([]);

  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const categories = useSelector((state) => state.category.categories || []);

  const safeTransactions = transactions ?? [];
  const safeCategories = categories?.length ? categories : defaultCategories;

  /* ── Load JSON for past months ─────────────────────────────────────────── */
  useEffect(() => {
    if (selectedMonth === currentMonth) {
      setJsonTransactions([]);
      return;
    }
    const load = async () => {
      try {
        const ms = String(selectedMonth).padStart(2, "0");
        const res = await fetch(`/Data/${currentYear}-${ms}.json`);
        if (!res.ok) throw new Error();
        setJsonTransactions(await res.json());
      } catch {
        setJsonTransactions([]);
      }
    };
    load();
  }, [selectedMonth, currentMonth, currentYear]);

  /* ── Category helpers ──────────────────────────────────────────────────── */
  const categoryMap = useMemo(() => {
    const map = {};
    safeCategories.forEach((c) => {
      map[String(c.id)] = c;
    });
    return map;
  }, [safeCategories]);

  const getCategory = (id) => categoryMap[String(id)] ?? null;
  const getCatColor = (id) => CATEGORY_COLORS[Number(id)] ?? "#94A3B8";

  /* ── Filter ────────────────────────────────────────────────────────────── */
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === currentMonth) {
      return safeTransactions.filter((tx) => {
        const d = new Date(tx.date || tx.createdAt);
        return (
          d.getMonth() + 1 === selectedMonth && d.getFullYear() === currentYear
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

  /* ── Totals ────────────────────────────────────────────────────────────── */
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0,
      expense = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === "Income") income += Number(tx.amount || 0);
      else expense += Number(tx.amount || 0);
    });
    return { totalIncome: income, totalExpense: expense };
  }, [filteredTransactions]);

  const net = totalIncome - totalExpense;

  /* ── Group by date ─────────────────────────────────────────────────────── */
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

    const otherKeys = Object.keys(groups)
      .filter((k) => k !== "Today" && k !== "Yesterday")
      .sort((a, b) => b.localeCompare(a));

    const orderedKeys = [];
    if (groups["Today"]) orderedKeys.push("Today");
    if (groups["Yesterday"]) orderedKeys.push("Yesterday");
    orderedKeys.push(...otherKeys);

    return { groups, orderedKeys };
  }, [filteredTransactions]);

  return (
    <div className="bg-[#121212] text-white min-h-screen pb-28">
      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md px-4 pt-6 pb-3 border-b border-white/6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              History
            </p>
            <h2 className="text-xl font-bold leading-tight">
              {MONTHS[selectedMonth - 1]}
            </h2>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-[#2A2A2E] text-white text-sm px-3 py-2 rounded-xl border border-white/10 appearance-none"
          >
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* ── Summary strip ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Income", value: fmt(totalIncome), color: "#22C55E" },
            { label: "Expense", value: fmt(totalExpense), color: "#F43F5E" },
            {
              label: "Net",
              value: fmt(Math.abs(net)),
              color: net >= 0 ? "#22C55E" : "#F43F5E",
              prefix: net >= 0 ? "+" : "-",
            },
          ].map(({ label, value, color, prefix = "" }) => (
            <div
              key={label}
              className="rounded-2xl bg-[#1C1C1E] border border-white/8 px-3 py-3 flex flex-col gap-1"
            >
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {label}
              </p>
              <p className="text-sm font-bold truncate" style={{ color }}>
                {prefix}₹{value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Transaction count pill ───────────────────────────────────────── */}
        {filteredTransactions.length > 0 && (
          <p className="text-[11px] text-gray-600 text-right">
            {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {groupedByDate.orderedKeys.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">🗂️</span>
            <p className="text-gray-500 text-sm">
              No transactions in {MONTHS[selectedMonth - 1]}
            </p>
          </div>
        )}

        {/* ── Grouped list ─────────────────────────────────────────────────── */}
        {groupedByDate.orderedKeys.map((label) => {
          // day-level subtotal
          const dayTxs = groupedByDate.groups[label];
          const dayExpense = dayTxs
            .filter((t) => t.type !== "Income")
            .reduce((s, t) => s + Number(t.amount || 0), 0);

          return (
            <div key={label}>
              {/* date label row */}
              <div className="flex justify-between items-center mb-2 px-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {label}
                </p>
                {dayExpense > 0 && (
                  <p className="text-[11px] text-gray-600">
                    −₹{fmt(dayExpense)}
                  </p>
                )}
              </div>

              {/* cards */}
              <ul className="space-y-2">
                {dayTxs.map((t, idx) => {
                  const category = getCategory(t.categoryId);
                  const color = getCatColor(t.categoryId);
                  const isIncome = t.type === "Income";

                  return (
                    <li
                      key={t.id ?? idx}
                      className="flex items-center gap-3 bg-[#1C1C1E] rounded-2xl px-4 py-3 border border-white/6 active:scale-[0.98] transition-transform"
                    >
                      {/* icon bubble */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: color + "22",
                          border: `1px solid ${color}44`,
                        }}
                      >
                        <span className="text-xl leading-none">
                          {category?.icon ?? "📦"}
                        </span>
                      </div>

                      {/* details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {t.subcategoryName || category?.name || "Transaction"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {/* category color dot */}
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-[11px] text-gray-500 truncate">
                            {category?.name ?? "Unknown"}
                            {t.paymentMethod ? ` · ${t.paymentMethod}` : ""}
                          </p>
                        </div>
                      </div>

                      {/* amount + time */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-sm font-bold"
                          style={{ color: isIncome ? "#22C55E" : "#F87171" }}
                        >
                          {isIncome ? "+" : "−"}₹{fmt(t.amount)}
                        </p>
                        <p className="text-[10px] text-gray-600 mt-0.5">
                          {t.time ?? ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default TransactionHistory;
