import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaList, FaChartPie, FaBullseye, FaCog } from "react-icons/fa";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0  bg-black flex justify-around items-center py-2 shadow-lg z-50">
      {/* Home */}
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-500" : "text-gray-400"
          }`
        }
      >
        <FaHome className="text-xl" />
        <span>Home</span>
      </NavLink>

      {/* Transactions */}
      <NavLink
        to="/transactionspath"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-500" : "text-gray-400"
          }`
        }
      >
        <FaList className="text-xl" />
        <span>Trans</span>
      </NavLink>

      {/* Stats */}
      <NavLink
        to="/stats"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-500" : "text-gray-400"
          }`
        }
      >
        <FaChartPie className="text-xl" />
        <span>Stats</span>
      </NavLink>

      {/* Budget */}
      <NavLink
        to="/budget"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-500" : "text-gray-400"
          }`
        }
      >
        <FaBullseye className="text-xl" />
        <span>Budget</span>
      </NavLink>

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-500" : "text-gray-400"
          }`
        }
      >
        <FaCog className="text-xl" />
        <span>Settings</span>
      </NavLink>
    </div>
  );
};

export default BottomNav;
