import { useDispatch, useSelector } from "react-redux";
import BottomNav from "../component/BottomNav";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { setBudget } from "../features/dataSlice";

export default function Budget() {
  const budget = useSelector((state) => state.transaction.budget ?? 0);
  const dispatch = useDispatch();
  const [newBudget, setNewBudget] = useState("");

  const handleBudgetUpdate = (e) => {
    e.preventDefault();

    const budgetValue = parseFloat(newBudget);

    if (isNaN(budgetValue) || budgetValue < 0) {
      toast.error("Please enter a valid non-negative number for the budget.");
      return;
    }

    dispatch(setBudget(budgetValue));
    toast.success("Budget updated successfully!");
    setNewBudget("");
  };

  useEffect(() => { 
    // console.log("Budget updated:", budget);
  }, [budget]);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 pt-16">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Budget Overview</h1>
        <p className="text-gray-400 text-sm">
          Manage your finances effectively
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold text-gray-300">Your Budget</h2>
        <p className="text-4xl font-bold text-green-400 mt-2">
          ₹{Number(budget).toFixed(2)}
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">
          Manage Your Budget
        </h2>

        <form onSubmit={handleBudgetUpdate} className="flex flex-col gap-4">
          <input
            type="number"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            placeholder="Enter new budget"
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={!newBudget || parseFloat(newBudget) < 0}
            className={`w-full ${
              !newBudget || parseFloat(newBudget) < 0
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white font-bold py-3 rounded-lg transition duration-200`}
          >
            Update Budget
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
