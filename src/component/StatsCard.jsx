import React from "react";

const StatsCards = ({ totalIncome = 0, totalExpense = 0, budget = 5000 }) => {
  const remaining = totalIncome - totalExpense;
  const budgetUsed = ((totalExpense / budget) * 100).toFixed(0);

  const cards = [
    {
      label: "Income",
      amount: totalIncome,
      icon: "↓",
      iconBg: "bg-teal-500",
      iconColor: "text-white",
      glowColor: "hover:shadow-teal-400/50",
    },
    {
      label: "Expense",
      amount: totalExpense,
      icon: "↑",
      iconBg: "bg-red-500",
      iconColor: "text-white",
      glowColor: "hover:shadow-red-400/50",
    },
    {
      label: "Savings",
      amount: remaining,
      icon: "💰",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      glowColor: "hover:shadow-blue-400/50",
    },
    {
      label: "Budget Used",
      amount: `${budgetUsed}%`,
      subText: `of ₹${budget}`,
      icon: "📊",
      iconBg: "bg-yellow-500",
      iconColor: "text-white",
      glowColor: "hover:shadow-yellow-400/50",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-1 pb-5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`relative
                rounded-2xl p-6
                bg-linear-to-br from-white/10 via-white/5 to-white/10
                backdrop-blur-xl
                border border-white/20
                shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                transition-all duration-300
                hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)]
                ${card.glowColor}
                hover:scale-[1.02]
                cursor-pointer`}
          >
            {/* Icon in top-right */}
            <div className="flex  items-center  mb-4">
              <div />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconBg} ${card.iconColor}`}
              >
                <span className="text-xl">{card.icon}</span>
              </div>
            </div>

            {/* Label */}
            <p className="text-1xl text-gray-300 mb-2">{card.label}</p>

            {/* Amount */}
            <p className="text-1xl font-bold text-white mb-1">₹{card.amount}</p>

            {/* Sub text (for Budget Used) */}
            {card.subText && (
              <p className="text-xs text-gray-400">{card.subText}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default StatsCards;
