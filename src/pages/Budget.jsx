import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../component/BottomNav";
import { toast } from "react-toastify";

import { useState } from "react";
import { setBudget } from "../features/dataSlice";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/appDB";

const fmt = (n) =>
  Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export default function Budget() {
  const budget   = useSelector((state) => state.transaction.budget ?? 0);
  const dispatch = useDispatch();
  const [newBudget, setNewBudget] = useState("");

  // ── Live total expense for current month ──────────────────────────────────
  const totalExpense = useLiveQuery(async () => {
    const now = new Date();
    const txs = await db.transactions.where("type").equals("Expense").toArray();
    return txs
      .filter((tx) => {
        const d = new Date(tx.date || tx.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  }, []) ?? 0;

  const spent     = Math.min(totalExpense, budget);
  const remaining = Math.max(budget - totalExpense, 0);
  const pct       = budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;
  const isOver    = totalExpense > budget && budget > 0;
  const isSafe    = pct < 70;
  const meterColor = isOver ? "#F43F5E" : pct >= 70 ? "#FBBF24" : "#22C55E";

  const handleUpdate = () => {
    const val = parseFloat(newBudget);
    if (isNaN(val) || val < 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    dispatch(setBudget(val));
    toast.success("Budget updated!");
    setNewBudget("");
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-4 pt-8 pb-28 space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">Monthly</p>
        <h1 className="text-2xl font-black tracking-tight">Budget</h1>
      </div>

      {/* ── Budget meter card ───────────────────────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)" }}>
        {/* glow */}
        <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: meterColor, opacity: 0.12, filter: "blur(32px)" }} />

        <div className="relative px-5 py-6 space-y-4">
          {/* Budget amount */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-blue-300/60">Total Budget</p>
            <p className="text-4xl font-black mt-0.5">
              {budget > 0 ? `₹${fmt(budget)}` : <span className="text-gray-600">Not set</span>}
            </p>
          </div>

          {/* Progress bar */}
          {budget > 0 && (
            <div className="space-y-1.5">
              <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: meterColor,
                    boxShadow: `0 0 10px ${meterColor}88` }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span style={{ color: meterColor }}>
                  {pct.toFixed(0)}% used
                </span>
                <span className="text-gray-500">
                  {isOver ? `₹${fmt(totalExpense - budget)} over budget` : `₹${fmt(remaining)} left`}
                </span>
              </div>
            </div>
          )}

          {/* Spent / Remaining row */}
          {budget > 0 && (
            <div className="flex gap-4 pt-2 border-t border-white/10">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Spent</p>
                <p className="text-base font-bold text-rose-400">₹{fmt(totalExpense)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Remaining</p>
                <p className="text-base font-bold" style={{ color: meterColor }}>
                  ₹{fmt(remaining)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Status badge ────────────────────────────────────────────────────── */}
      {budget > 0 && (
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 border"
          style={{
            backgroundColor: meterColor + "12",
            borderColor:     meterColor + "33",
          }}>
          <span className="text-xl">
            {isOver ? "🚨" : pct >= 70 ? "⚠️" : "✅"}
          </span>
          <p className="text-sm font-medium" style={{ color: meterColor }}>
            {isOver
              ? `You've exceeded your budget by ₹${fmt(totalExpense - budget)}`
              : pct >= 70
              ? `${(100 - pct).toFixed(0)}% of budget remaining — spend carefully`
              : `You're on track! ₹${fmt(remaining)} still available`}
          </p>
        </div>
      )}

      {/* ── Quick set pills ──────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">Quick Set</p>
        <div className="grid grid-cols-4 gap-2">
          {[5000, 10000, 15000, 20000].map((amt) => (
            <button key={amt} onClick={() => setNewBudget(String(amt))}
              className="py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95"
              style={{
                backgroundColor: newBudget === String(amt) ? "#3B82F622" : "#1C1C1E",
                borderColor:     newBudget === String(amt) ? "#3B82F6"   : "rgba(255,255,255,0.06)",
                color:           newBudget === String(amt) ? "#60A5FA"   : "#6B7280",
              }}>
              ₹{(amt / 1000).toFixed(0)}k
            </button>
          ))}
        </div>
      </div>

      {/* ── Update form ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#1C1C1E] border border-white/8 px-4 py-5 space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">Set New Budget</p>

        <div className="flex items-center gap-2 bg-[#121212] rounded-xl px-4 py-3 border border-white/8">
          <span className="text-gray-500 text-lg font-bold">₹</span>
          <input
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            placeholder="Enter amount"
            inputMode="decimal"
            className="flex-1 bg-transparent text-white text-lg font-bold focus:outline-none placeholder-gray-700"
          />
          {newBudget !== "" && (
            <button onClick={() => setNewBudget("")}
              className="text-gray-600 text-sm">✕</button>
          )}
        </div>

        <button
          onClick={handleUpdate}
          disabled={!newBudget || parseFloat(newBudget) < 0}
          className="w-full py-3.5 rounded-xl text-sm font-black tracking-wide transition-all active:scale-95 disabled:opacity-30"
          style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
        >
          Update Budget
        </button>
      </div>

      <BottomNav />
    </div>
  );
}