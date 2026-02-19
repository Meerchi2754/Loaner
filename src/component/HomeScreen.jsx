import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { db } from "../db/appDB";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import Navbar from "./HeaderNav";
import StatsCards from "./StatsCard";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import History from "./HistoryTransaction";

ChartJS.register(ArcElement, Tooltip, Legend);

const HomeScreen = () => {
  const navigate = useNavigate();
  const categories = useSelector((state) => state.category);
  const [allTransactions, setAllTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const budget = useSelector((state) => state.transaction.budget);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tx = await db.transactions.toArray();
        console.log("Loaded transactions:", tx);
        if (mounted) setAllTransactions(tx);
      } catch (err) {
        console.error("Failed to load transactions:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totalExpense = useLiveQuery(async () => {
    const expenses = await db.transactions
      .where("type")
      .equals("Expense")
      .toArray();
    console.log(expenses);
    console.log(
      "Calculating total expense from transactions:",
      expenses.reduce((sum, t) => sum + t.amount, 0),
    );

    return expenses.reduce((sum, t) => sum + t.amount, 0);
  }, []);

 const totalIncome = useLiveQuery(async () => {
    const income = await db.transactions
      .where("type")
      .equals("Income")
      .toArray();
    console.log(income);
    return income.reduce((sum, t) => sum + t.amount, 0);
  }, []);
  const totalBalance = totalIncome - totalExpense;

  const categoryTotal = useMemo(() => {
    return allTransactions.reduce((acc, tx) => {
      const catName =
        categories[tx.categoryId - 1]?.name ??
        `Category ${tx.categoryId ?? "?"}`;
      acc[catName] = (acc[catName] || 0) + Number(tx.amount || 0);
      return acc;
    }, {});
  }, [allTransactions]);

  const categoryData = {
    labels: Object.keys(categoryTotal),
    datasets: [
      {
        data: Object.values(categoryTotal),
        backgroundColor: [
          "#34D399", // Green
          "#F87171", // Red
          "#FBBF24", // Yellow
          "#60A5FA", // Blue
          "#A78BFA", // Purple
          "#F59E0B", // Orange
        ],
        borderWidth: 0,
      },
    ],
  };

  const categoryOptions = {
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
    },
    cutout: "70%", // Creates the donut effect
  };

  const addTransaction = () => {
    navigate("/addtransaction");
  };
  return (
    <>
      <div className="bg-[#121212] text-amber-50 w-full min-h-screen p-4 pt-21 relative ">
        <Navbar totalBalance={totalBalance} budget={budget} />
        <StatsCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          budget={budget}
        />

        {/* Category Breakdown */}
        <div
          className="p-4 sm:p-6 rounded-2xl shadow-lg bg-linear-to-br from-white/10 via-white/5 to-white/10
                backdrop-blur-xl border border-white/20 mb-6"
        >
          <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
          <div className="flex flex-col sm:flex-row items-center">
            {/* Donut Chart */}
            <div className="w-40 h-40 sm:w-60 sm:h-60">
              <Doughnut data={categoryData} options={categoryOptions} />
            </div>

            {/* Legend */}
            <div className="w-full sm:w-1/2 mt-4 sm:mt-0 sm:pl-4">
              <ul className="space-y-2">
                {Object.keys(categoryTotal).map((category, idx) => (
                  <li key={category} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full`}
                      style={{
                        backgroundColor:
                          categoryData.datasets[0].backgroundColor[idx],
                      }}
                    ></span>
                    <span className="text-sm text-gray-300">{category}</span>
                  </li>
                ))}
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white w-3/4 h-3/4 rounded-2xl p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
              {/* Add your form or content here */}
              {navigate("/addtransaction")}
              {/* <button
                onClick={() => navigate("/addtransaction")}
                className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
              >
                Go to Add Transaction
              </button> */}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <History categories={categories} allTransactions={allTransactions} />
        </div>
      </div>
    </>
  );
};

export default HomeScreen;
