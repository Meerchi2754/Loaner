import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { db } from "../db/appDB";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/HeaderNav";
import StatsCards from "../component/StatsCard";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import History from "../component/HistoryTransaction";
import BottomNav from "../component/BottomNav";
import { defaultCategories } from "../model/category";

ChartJS.register(ArcElement, Tooltip, Legend);

// ── Shared category color palette (same across all pages) ───────────────────
const CATEGORY_COLORS = {
  1:  "#F97316", // Food
  2:  "#60A5FA", // Travel
  11: "#A78BFA", // Petrol
  3:  "#FBBF24", // Bills
  4:  "#F43F5E", // Shopping
  5:  "#34D399", // Salary
  6:  "#FB7185", // Rapido
  7:  "#94A3B8", // Others
  8:  "#38BDF8", // Service
  9:  "#22C55E", // Papa
  10: "#E879F9", // Aryan
};

const fmt = (n) =>
  Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const HomeScreen = () => {
  const navigate   = useNavigate();
  const budget     = useSelector((state) => state.transaction.budget);
  const categories = useSelector((state) => state.category.categories || []);

  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tx = await db.transactions.toArray();
        if (mounted) setAllTransactions(tx);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totalExpense = useLiveQuery(async () => {
    const expenses = await db.transactions.where("type").equals("Expense").toArray();
    return expenses.reduce((sum, t) => sum + t.amount, 0);
  }, []);

  const totalIncome = useLiveQuery(async () => {
    const income = await db.transactions.where("type").equals("Income").toArray();
    return income.reduce((sum, t) => sum + t.amount, 0);
  }, []);

  const totalBalance = (totalIncome || 0) - (totalExpense || 0);
  const isPositive   = totalBalance >= 0;

  // ── Category totals using categoryId → color map ─────────────────────────
  const categoryEntries = useMemo(() => {
    const totals = {};
    allTransactions.forEach((tx) => {
      const cat = (categories.length ? categories : defaultCategories)
        .find((c) => c.id === tx.categoryId);
      const key = cat?.id ?? 0;
      totals[key] = (totals[key] || 0) + Number(tx.amount || 0);
    });
    return Object.entries(totals).map(([id, amount]) => {
      const numId = Number(id);
      const cat   = (categories.length ? categories : defaultCategories)
        .find((c) => c.id === numId);
      return { id: numId, name: cat?.name ?? "Unknown", icon: cat?.icon ?? "📦", amount };
    }).sort((a, b) => b.amount - a.amount);
  }, [allTransactions, categories]);

  const doughnutData = {
    labels: categoryEntries.map((e) => e.name),
    datasets: [{
      data:            categoryEntries.map((e) => e.amount),
      backgroundColor: categoryEntries.map((e) => CATEGORY_COLORS[e.id] ?? "#94A3B8"),
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    plugins: { legend: { display: false } },
    cutout: "72%",
  };

  const totalSpend = categoryEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className="bg-[#121212] text-white w-full min-h-screen pb-28 relative">
        <Navbar totalBalance={totalBalance} budget={budget} />

        <div className="px-4 pt-20 space-y-4">

          {/* ── Hero balance card ─────────────────────────────────────────── */}
          <div className="rounded-3xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
            {/* decorative ring */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10"
              style={{ background: isPositive ? "#22C55E" : "#F43F5E", filter: "blur(30px)" }} />
            <div className="relative px-5 py-6">
              <p className="text-[11px] uppercase tracking-widest text-blue-300/70 mb-1">Net Balance</p>
              <p className="text-4xl font-black tracking-tight"
                style={{ color: isPositive ? "#22C55E" : "#F43F5E" }}>
                {isPositive ? "+" : "−"}₹{fmt(Math.abs(totalBalance))}
              </p>
              <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Income</p>
                  <p className="text-base font-bold text-emerald-400">+₹{fmt(totalIncome || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Expense</p>
                  <p className="text-base font-bold text-rose-400">−₹{fmt(totalExpense || 0)}</p>
                </div>
                {budget > 0 && (
                  <div className="ml-auto text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Budget</p>
                    <p className="text-base font-bold text-amber-400">₹{fmt(budget)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <StatsCards
            totalIncome={totalIncome || 0}
            totalExpense={totalExpense || 0}
            budget={budget}
          />

          {/* ── Category Breakdown ────────────────────────────────────────── */}
          {categoryEntries.length > 0 && (
            <div className="rounded-2xl bg-[#1C1C1E] border border-white/8 p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Spending Breakdown</p>

              <div className="flex items-center gap-4">
                {/* Donut */}
                <div className="relative w-28 h-28 flex-shrink-0">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[9px] text-gray-500">Total</p>
                    <p className="text-xs font-bold">₹{fmt(totalSpend)}</p>
                  </div>
                </div>

                {/* Legend — icon + name + amount */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  {categoryEntries.slice(0, 5).map((entry) => {
                    const color = CATEGORY_COLORS[entry.id] ?? "#94A3B8";
                    const pct   = totalSpend > 0 ? (entry.amount / totalSpend) * 100 : 0;
                    return (
                      <div key={entry.id} className="flex items-center gap-2">
                        <span className="text-base leading-none flex-shrink-0">{entry.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-gray-300 truncate">{entry.name}</span>
                            <span className="text-gray-500 flex-shrink-0 ml-1">₹{fmt(entry.amount)}</span>
                          </div>
                          <div className="w-full bg-white/8 rounded-full h-1">
                            <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {categoryEntries.length > 5 && (
                    <p className="text-[10px] text-gray-600 text-right">+{categoryEntries.length - 5} more</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Recent Transactions ───────────────────────────────────────── */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Recent</p>
            <History categories={categories} allTransactions={allTransactions} />
          </div>
        </div>

        {/* ── FAB ──────────────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate("/addtransaction")}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl font-bold transition-transform active:scale-90 z-30"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          +
        </button>
      </div>

      <BottomNav />
    </>
  );
};

export default HomeScreen;