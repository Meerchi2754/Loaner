import { useState } from "react";
import { useSelector } from "react-redux";
import { db } from "../db/appDB";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { defaultCategories } from "../model/category";

// ── Category colors (same palette across all pages) ─────────────────────────
const CATEGORY_COLORS = {
  1: "#F97316",
  2: "#60A5FA",
  11: "#A78BFA",
  3: "#FBBF24",
  4: "#F43F5E",
  5: "#34D399",
  6: "#FB7185",
  7: "#94A3B8",
  8: "#38BDF8",
  9: "#22C55E",
  10: "#E879F9",
};

const PAYMENT_METHODS = [
  { value: "GPAY", label: "GPay", icon: "📱" },
  { value: "BHIM", label: "BHIM", icon: "🇮🇳" },
  { value: "CASH", label: "Cash", icon: "💵" },
  { value: "CHEQUE", label: "Cheque", icon: "📄" },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const categories = useSelector((state) => state.category.categories);
  const safeCategories = categories?.length ? categories : defaultCategories;

  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("GPAY");
  const [categoryId, setCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedCat = safeCategories.find((c) => c.id === Number(categoryId));
  const selectedColor = CATEGORY_COLORS[Number(categoryId)] ?? "#60A5FA";
  const isExpense = type === "Expense";

  async function handleSubmit() {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category.");
      return;
    }

    const payload = {
      type,
      amount: Number(amount),
      categoryId: Number(categoryId),
      subcategories: subcategories.trim() || null,
      paymentMethod,
      date,
      time,
      note: note.trim() || null,
      createdAt: new Date().toISOString(),
    };

    try {
      setIsLoading(true);
      await db.transactions.add(payload);
      toast.success("Transaction saved!");
      navigate("/home");
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button
          onClick={() => navigate("/home")}
          className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-lg"
        >
          ←
        </button>
        <h1 className="text-base font-bold">Add Transaction</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-5 pt-2">
        {/* ── Type toggle ────────────────────────────────────────────────── */}
        <div className="bg-[#1C1C1E] rounded-2xl p-1 flex gap-1">
          {["Expense", "Income"].map((t) => {
            const active = type === t;
            const color = t === "Expense" ? "#F43F5E" : "#22C55E";
            return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  backgroundColor: active ? color : "transparent",
                  color: active ? "#fff" : "#6B7280",
                }}
              >
                {t === "Expense" ? "💸 Expense" : "💰 Income"}
              </button>
            );
          })}
        </div>

        {/* ── Amount ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[#1C1C1E] border border-white/8 px-5 py-6 text-center">
          <p
            className="text-[10px] uppercase tracking-widest mb-2"
            style={{ color: isExpense ? "#F43F5E" : "#22C55E" }}
          >
            {isExpense ? "Expense Amount" : "Income Amount"}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-gray-400">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-5xl font-black text-white text-center focus:outline-none w-48"
              placeholder="0"
              min="0"
              step="1"
              inputMode="decimal"
            />
          </div>
        </div>

        {/* ── Category grid ──────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">
            Category
          </p>
          <div className="grid grid-cols-4 gap-2">
            {safeCategories.map((cat) => {
              const active = Number(categoryId) === cat.id;
              const color = CATEGORY_COLORS[cat.id] ?? "#94A3B8";
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(String(cat.id))}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all active:scale-95"
                  style={{
                    backgroundColor: active ? color + "22" : "#1C1C1E",
                    borderColor: active ? color : "rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-2xl leading-none">{cat.icon}</span>
                  <span
                    className="text-[10px] font-medium truncate w-full text-center px-1"
                    style={{ color: active ? color : "#9CA3AF" }}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Payment method pills ───────────────────────────────────────── */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">
            Payment Method
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map(({ value, label, icon }) => {
              const active = paymentMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: active ? "#3B82F622" : "#1C1C1E",
                    borderColor: active ? "#3B82F6" : "rgba(255,255,255,0.06)",
                    color: active ? "#60A5FA" : "#6B7280",
                  }}
                >
                  <span className="text-lg">{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Date & Time row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">
              Date
            </p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#1C1C1E] text-white rounded-xl px-3 py-3 text-sm border border-white/8 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">
              Time
            </p>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#1C1C1E] text-white rounded-xl px-3 py-3 text-sm border border-white/8 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* ── Subcategory ────────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">
            Subcategory{" "}
            <span className="normal-case text-gray-600">(optional)</span>
          </p>
          <input
            type="text"
            value={subcategories}
            onChange={(e) => setSubcategories(e.target.value)}
            placeholder={
              selectedCat
                ? `e.g. ${selectedCat.name} detail…`
                : "e.g. Groceries, Petrol..."
            }
            className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-sm border border-white/8 focus:outline-none focus:border-blue-500/50 placeholder-gray-600"
          />
        </div>

        {/* ── Note ───────────────────────────────────────────────────────── */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 px-1">
            Note <span className="normal-case text-gray-600">(optional)</span>
          </p>
          <textarea
            value={note}
            placeholder="What was this for?"
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-[#1C1C1E] text-white rounded-xl px-4 py-3 text-sm border border-white/8 resize-none focus:outline-none focus:border-blue-500/50 placeholder-gray-600"
          />
        </div>

        {/* ── Save button ────────────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl text-sm font-black tracking-wide transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: isLoading
              ? "#374151"
              : isExpense
                ? "linear-gradient(135deg, #F43F5E, #FB7185)"
                : "linear-gradient(135deg, #22C55E, #34D399)",
          }}
        >
          {isLoading ? "Saving…" : `Save ${type}`}
        </button>
      </div>
    </div>
  );
}
