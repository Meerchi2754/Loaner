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

ChartJS.register(ArcElement, Tooltip, Legend);

const HomeScreen = () => {
  const navigate = useNavigate();

  // ✅ Redux state
  const budget = useSelector((state) => state.transaction.budget);
  const categories = useSelector(
    (state) => state.category.categories || []
  );

  const [allTransactions, setAllTransactions] = useState([]);

  // ✅ Load transactions from IndexedDB
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

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Live total expense
  const totalExpense = useLiveQuery(async () => {
    const expenses = await db.transactions
      .where("type")
      .equals("Expense")
      .toArray();

    return expenses.reduce((sum, t) => sum + t.amount, 0);
  }, []);

  // ✅ Live total income
  const totalIncome = useLiveQuery(async () => {
    const income = await db.transactions
      .where("type")
      .equals("Income")
      .toArray();

    return income.reduce((sum, t) => sum + t.amount, 0);
  }, []);

  const totalBalance =
    (totalIncome || 0) - (totalExpense || 0);

  // ✅ Safe category mapping (NO index-based logic)
  const categoryTotal = useMemo(() => {
    return allTransactions.reduce((acc, tx) => {
      const categoryObj = categories.find(
        (c) => c.id === tx.categoryId
      );

      const catName = categoryObj?.name ?? "Unknown";

      acc[catName] =
        (acc[catName] || 0) + Number(tx.amount || 0);

      return acc;
    }, {});
  }, [allTransactions, categories]);

  const categoryData = {
    labels: Object.keys(categoryTotal),
    datasets: [
      {
        data: Object.values(categoryTotal),
        backgroundColor: [
          "#34D399",
          "#F87171",
          "#FBBF24",
          "#60A5FA",
          "#A78BFA",
          "#F59E0B",
        ],
        borderWidth: 0,
      },
    ],
  };

  const categoryOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: "70%",
  };

  return (
    <>
      <div className="bg-[#121212] text-amber-50 w-full min-h-screen p-4 pt-21 relative">
        <Navbar totalBalance={totalBalance} budget={budget} />

        <StatsCards
          totalIncome={totalIncome || 0}
          totalExpense={totalExpense || 0}
          budget={budget}
        />

        {/* Category Breakdown */}
        <div className="p-4 sm:p-6 rounded-2xl shadow-lg bg-linear-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border border-white/20 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Category Breakdown
          </h2>

          <div className="flex flex-col sm:flex-row items-center">
            <div className="w-40 h-40 sm:w-60 sm:h-60">
              <Doughnut
                data={categoryData}
                options={categoryOptions}
              />
            </div>

            {/* Custom Legend */}
            <div className="w-full sm:w-1/2 mt-4 sm:mt-0 sm:pl-4">
              <ul className="space-y-2 grid grid-cols-3">
                {Object.keys(categoryTotal).map(
                  (category, idx) => (
                    <li
                      key={category}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor:
                            categoryData.datasets[0]
                              .backgroundColor[idx],
                        }}
                      ></span>
                      <span className="text-sm text-gray-300">
                        {category}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => navigate("/addtransaction")}
          className="fixed bottom-25 right-5 bg-blue-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-blue-600 transition"
        >
          +
        </button>

        {/* Transaction History */}
        <div className="p-4 sm:p-6">
          <History
            categories={categories}
            allTransactions={allTransactions}
          />
        </div>
      </div>

      <BottomNav />
    </>
  );
};

export default HomeScreen;