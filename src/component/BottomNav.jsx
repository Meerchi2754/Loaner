import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaList, FaChartPie, FaBullseye, FaCog } from "react-icons/fa";

const NAV_ITEMS = [
  { to: "/home",             icon: FaHome,     label: "Home"     },
  { to: "/transactionspath", icon: FaList,     label: "History"  },
  { to: "/stats",            icon: FaChartPie, label: "Stats"    },
  { to: "/budget",           icon: FaBullseye, label: "Budget"   },
  { to: "/settings",         icon: FaCog,      label: "Settings" },
];

const BottomNav = () => {
  return (
    <>
      {/* Glass bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 py-2"
        style={{
          background:   "rgba(13,13,18,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop:    "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1"
          >
            {({ isActive }) => (
              <div className="flex flex-col items-center gap-0.5">

                {/* Icon container — pill highlight when active */}
                <div
                  className="flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? "rgba(59,130,246,0.18)" : "transparent",
                  }}
                >
                  <Icon
                    style={{
                      fontSize:  isActive ? "1.15rem" : "1rem",
                      color:     isActive ? "#60A5FA" : "#4B5563",
                      filter:    isActive ? "drop-shadow(0 0 6px #3B82F6aa)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                </div>

                {/* Label */}
                <span
                  className="text-[10px] font-semibold tracking-wide transition-all duration-200"
                  style={{ color: isActive ? "#60A5FA" : "#4B5563" }}
                >
                  {label}
                </span>

                {/* Active dot */}
                <div
                  className="w-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? "#3B82F6" : "transparent",
                    boxShadow:       isActive ? "0 0 6px #3B82F6" : "none",
                  }}
                />
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* Spacer so content isn't hidden behind nav */}
      <div style={{ height: "6px" }} />
    </>
  );
};

export default BottomNav;