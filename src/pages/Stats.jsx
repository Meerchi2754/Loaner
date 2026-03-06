import { useState, useEffect, useMemo } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/appDB";
import BottomNav from "../component/BottomNav";
import { toast } from "react-toastify";
import { defaultCategories } from "../model/category";

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Tooltip, Legend);

// Color keyed by categoryId — each category has its own permanent color.
const CATEGORY_COLORS = {
  1:  "#F43F5E", // Food      — red
  2:  "#60A5FA", // Travel    — sky blue
  11: "#B500B2", // Petrol    — violet
  3:  "#FBBF24", // Bills     — amber
  4:  "#F97316", // Shopping  — orange
  5:  "#34D399", // Salary    — emerald
  6:  "#FB7185", // Rapido    — pink
  7:  "#94A3B8", // Others    — slate grey
  8:  "#38BDF8", // Service   — light blue
  9:  "#22C55E", // Papa      — vivid green ← locked
  10: "#E879F9", // Aryan     — fuchsia
};

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(0, i).toLocaleString("default", { month: "long" })
);

export default function Stats() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [jsonTransactions, setJsonTransactions] = useState([]);
  const [allMonthsData, setAllMonthsData] = useState({});

  const transactions = useLiveQuery(() => db.transactions.toArray(), []);

  // Load selected month's data (for non-current months)
  useEffect(() => {
    if (selectedMonth === currentMonth) {
      setJsonTransactions([]);
      return;
    }
    const load = async () => {
      try {
        const monthString = String(selectedMonth).padStart(2, "0");
        const res = await fetch(`/Data/${currentYear}-${monthString}.json`);
        if (!res.ok) throw new Error("No JSON file found.");
        const data = await res.json();
        setJsonTransactions(data);
      } catch {
        toast.error("Failed to load transactions for the selected month.");
        setJsonTransactions([]);
      }
    };
    load();
  }, [selectedMonth, currentMonth, currentYear]);

  // Load all past months for trend chart
  useEffect(() => {
    const loadAll = async () => {
      const result = {};
      for (let m = 1; m < currentMonth; m++) {
        try {
          const monthString = String(m).padStart(2, "0");
          const res = await fetch(`/Data/${currentYear}-${monthString}.json`);
          if (res.ok) {
            const data = await res.json();
            result[m] = data;
          }
        } catch {}
      }
      setAllMonthsData(result);
    };
    loadAll();
  }, [currentMonth, currentYear]);

  const mapCategoryIdToName = (categoryId) => {
    const cat = defaultCategories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const mapCategoryIdToColor = (categoryId) => {
    return CATEGORY_COLORS[categoryId] ?? "#94A3B8";
  };

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === currentMonth) {
      return (transactions ?? []).filter((tx) => {
        const d = new Date(tx.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      });
    }
    return jsonTransactions;
  }, [selectedMonth, currentMonth, currentYear, transactions, jsonTransactions]);

  // ── Category totals ──────────────────────────────────────────────────
  const categoryTotal = useMemo(() => {
    const acc = {};
    filteredTransactions.forEach((tx) => {
      const name = mapCategoryIdToName(tx.categoryId);
      acc[name] = (acc[name] || 0) + Number(tx.amount || 0);
    });
    return acc;
  }, [filteredTransactions]);

  const sortedCategories = useMemo(
    () => Object.entries(categoryTotal).sort((a, b) => b[1] - a[1]),
    [categoryTotal]
  );

  const totalSpend = useMemo(
    () => sortedCategories.reduce((s, [, v]) => s + v, 0),
    [sortedCategories]
  );

  // ── Income vs Expense totals ─────────────────────────────────────────
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0, expense = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === "income") income += Number(tx.amount || 0);
      else expense += Number(tx.amount || 0);
    });
    return { totalIncome: income, totalExpense: expense };
  }, [filteredTransactions]);

  // ── Monthly trend (bar chart) ────────────────────────────────────────
  const trendData = useMemo(() => {
    const labels = [];
    const values = [];
    for (let m = 1; m <= currentMonth; m++) {
      labels.push(MONTHS[m - 1].slice(0, 3));
      if (m === currentMonth) {
        const total = (transactions ?? [])
          .filter((tx) => {
            const d = new Date(tx.date);
            return d.getMonth() + 1 === m && d.getFullYear() === currentYear;
          })
          .reduce((s, tx) => s + Number(tx.amount || 0), 0);
        values.push(total);
      } else {
        const monthTxs = allMonthsData[m] || [];
        values.push(monthTxs.reduce((s, tx) => s + Number(tx.amount || 0), 0));
      }
    }
    return { labels, values };
  }, [allMonthsData, transactions, currentMonth, currentYear]);

  // ── Doughnut chart data ──────────────────────────────────────────────
  const doughnutData = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [
      {
        data: sortedCategories.map(([, val]) => val),
        backgroundColor: sortedCategories.map(([name]) => {
          const cat = defaultCategories.find((c) => c.name === name);
          return cat ? mapCategoryIdToColor(cat.id) : "#94A3B8";
        }),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    plugins: { legend: { display: false } },
    cutout: "72%",
  };

  // ── Bar chart data ───────────────────────────────────────────────────
  const barData = {
    labels: trendData.labels,
    datasets: [
      {
        label: "Spending",
        data: trendData.values,
        backgroundColor: trendData.labels.map((_, i) =>
          i === selectedMonth - 1 ? "#34D399" : "rgba(52,211,153,0.25)"
        ),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    plugins: { legend: { display: false }, tooltip: { callbacks: {
      label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString()}`,
    }}},
    scales: {
      x: { grid: { display: false }, ticks: { color: "#9CA3AF" } },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#9CA3AF", callback: (v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}` },
      },
    },
  };

  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const selectedMonthName = MONTHS[selectedMonth - 1];

  return (
    <>
      <div className="bg-[#121212] text-white p-4 pt-6 pb-24 min-h-screen space-y-5">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Overview</p>
            <h2 className="text-2xl font-bold">{selectedMonthName}</h2>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-gray-800 text-white px-3 py-2 rounded-xl text-sm border border-white/10"
          >
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>

        {/* ── Summary Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Spent", value: fmt(totalExpense), color: "#F43F5E", bg: "from-rose-500/10" },
            { label: "Income", value: fmt(totalIncome), color: "#34D399", bg: "from-emerald-500/10" },
            { label: "Net", value: fmt(totalIncome - totalExpense), color: totalIncome >= totalExpense ? "#34D399" : "#F43F5E", bg: "from-blue-500/10" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl p-3 bg-gradient-to-br ${bg} via-white/5 to-white/5 border border-white/10 flex flex-col gap-1`}>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Doughnut + Legend ───────────────────────────────────── */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Category Breakdown</h3>
          {sortedCategories.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No transactions this month.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Donut */}
              <div className="relative w-44 h-44 flex-shrink-0">
                <Doughnut data={doughnutData} options={doughnutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-gray-400">Total</p>
                  <p className="text-base font-bold">{fmt(totalSpend)}</p>
                </div>
              </div>

              {/* Legend pills */}
              <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                {sortedCategories.map(([name, amount]) => {
                  const cat = defaultCategories.find((c) => c.name === name);
                  const color = cat ? mapCategoryIdToColor(cat.id) : "#94A3B8";
                  const pct = totalSpend > 0 ? ((amount / totalSpend) * 100).toFixed(1) : 0;
                  return (
                    <div key={name} className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{name}</p>
                        <p className="text-[10px] text-gray-400">{pct}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Top Categories horizontal bars ──────────────────────── */}
        {sortedCategories.length > 0 && (
          <div className="rounded-2xl p-4 bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Categories</h3>
            <div className="space-y-3">
              {sortedCategories.slice(0, 6).map(([name, amount]) => {
                const cat = defaultCategories.find((c) => c.name === name);
                const color = cat ? mapCategoryIdToColor(cat.id) : "#94A3B8";
                const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
                        {name}
                      </span>
                      <span className="text-gray-400">{fmt(amount)}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Monthly Trend bar chart ──────────────────────────────── */}
        {trendData.values.some((v) => v > 0) && (
          <div className="rounded-2xl p-4 bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly Spending Trend</h3>
            <div className="h-44">
              <Bar data={barData} options={{ ...barOptions, maintainAspectRatio: false }} />
            </div>
          </div>
        )}

        {/* ── Transaction count card ───────────────────────────────── */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Transactions", value: filteredTransactions.length },
              { label: "Avg per Transaction", value: filteredTransactions.length ? fmt(totalSpend / filteredTransactions.length) : "—" },
              { label: "Categories Used", value: sortedCategories.length },
              { label: "Biggest Category", value: sortedCategories[0]?.[0] ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <BottomNav />
    </>
  );
}