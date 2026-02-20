import { useEffect, useState } from "react";
import { db } from "../db/appDB";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AddTransaction() {
  const navigate = useNavigate();

  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("GPAY UPI");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoriesId, setSubcategoriesId] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // "YYYY-MM-DD"
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5)); // "HH:MM"

  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false); // State for recurring transactions
  const [isLoading, setIsLoading] = useState(false); // Loading state for save button

  useEffect(() => {
    async function loadCategories() {
      const data = await db.categories.toArray();
      setCategories(data);
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadSubcategories() {
      if (!categoryId) {
        setSubcategories([]);
        setSubcategoriesId("");
        return;
      }
      const data = await db.subcategories
        .where("categoryId")
        .equals(Number(categoryId))
        .toArray();

      setSubcategories(data);
    }
    loadSubcategories();
  }, [categoryId]);

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
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
      subcategoriesId: subcategoriesId ? Number(subcategoriesId) : null,
      subcategoryName: subcategoryName ? subcategoryName.trim() : null,
      paymentMethod,
      date,
      time,
      note: note.trim() || null,
      isRecurring,
      createdAt: new Date().toISOString(),
    };

    try {
      setIsLoading(true); // Set loading state
      await db.transactions.add(payload);
      toast.success("Transaction Saved!");
      navigate("/home");
      setAmount("");
      setNote("");
      setSubcategoriesId("");
      setSubcategoryName("");
    } catch (error) {
      toast.error("Failed to save transaction. Please try again.");
    } finally {
      setIsLoading(false); // Reset loading state
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 text-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Transaction</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-white"
            aria-label="close"
            onClick={() => navigate("/home")}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Type Toggle */}
          <div className="bg-gray-700 rounded-xl p-1 flex gap-1">
            <button
              type="button"
              onClick={() => setType("Expense")}
              className={`flex-1 text-sm py-2 rounded-lg font-semibold transition ${
                type === "Expense"
                  ? "bg-red-500 text-white shadow"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("Income")}
              className={`flex-1 text-sm py-2 rounded-lg font-semibold transition ${
                type === "Income"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="text-center">
            <div className="text-xs text-gray-400">AMOUNT</div>
            <div className="mt-2 flex items-end justify-center gap-2">
              <span className="text-4xl text-gray-300 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-4xl font-bold text-white text-center focus:outline-none w-40"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              SubCategory
            </label>
            <textarea
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              placeholder={
                categoryId
                  ? "Enter subcategory name (optional)"
                  : "Select a category first"
              }
              disabled={!categoryId}
              rows={2}
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 resize-none focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              placeholder="What was this for?"
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 resize-none focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* Recurring checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="recurring"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            <label htmlFor="recurring" className="text-sm text-gray-300">
              Recurring transaction
            </label>
          </div>

          {/* Save button */}
          <div>
            <button
              type="submit"
              className={`w-full ${
                isLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white font-semibold py-3 rounded-lg shadow`}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
