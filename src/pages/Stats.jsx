import React from "react";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import BottomNav from "../component/BottomNav";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
);

export default function Stats() {
  const transactions = useSelector(
    (state) => state.transaction.transactions || [],
  );

  // Get the last 3 days' transactions
  const today = new Date();
  const lastThreeDays = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }).reverse();

  const dailySpending = lastThreeDays.map((date) => {
    const dailyTransactions = transactions.filter(
      (tx) => tx.date === date && tx.type === "Expense",
    );
    const totalSpent = dailyTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    return { date, totalSpent };
  });

  const totalSpentLast3Days = dailySpending.reduce(
    (sum, day) => sum + day.totalSpent,
    0,
  );

  const data = {
    labels: dailySpending.map((day) => day.date),
    datasets: [
      {
        label: "Total Spent",
        data: dailySpending.map((day) => day.totalSpent),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        pointBackgroundColor: "#4F46E5",
        pointBorderColor: "#fff",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 pt-16">
      {/* Analytics Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Analytics</h2>
          <select className="bg-gray-700 text-white p-2 rounded-lg">
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Spending Trend
          </h3>
          <Line data={data} options={options} />
        </div>
        <p className="text-sm text-gray-400 mt-4">
          Total Spent in Last 3 Days:{" "}
          <span className="text-green-400 font-bold">
            ₹{totalSpentLast3Days.toFixed(2)}
          </span>
        </p>
      </div>

      {/* Additional Features */}
      <div className="space-y-6">
        {/* Category Breakdown */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Category Breakdown
          </h3>
          <p className="text-gray-400 text-sm">Coming soon...</p>
        </div>

        {/* Comparison with Previous Period */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Comparison with Previous Period
          </h3>
          <p className="text-gray-400 text-sm">Coming soon...</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
