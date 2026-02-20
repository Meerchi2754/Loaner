import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaWallet,
  FaHome,
  FaExchangeAlt,
  FaChartBar,
  FaWallet as FaBudget,
  FaCog,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LockScreen = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const navigate = useNavigate();
  const userPin = useSelector((state) => state.user.password);
  const handlePinInput = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus to next input
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  // const handleUnlock = () => {
  //   if (pin.every((digit) => digit !== "")) {
  //     setIsUnlocked(true);
  //     // Reset PIN after 1 second
  //     setTimeout(() => {
  //       setPin(["", "", "", ""]);
  //       //setIsUnlocked(false);
  //     }, 1000);
  //   }
  // };
  const handleUnlock = () => {
    if (pin.every((digit) => digit !== "")) {
      const enteredPin = pin.join(""); // Combine the PIN array into a single string
      if (enteredPin === userPin) {
        //localStorage.setItem("isAuthenticated", "true"); // Set authentication flag
        navigate("/home"); // Redirect to the home page
      } else {
        toast.error("Incorrect PIN. Please try again.");
        //alert("Incorrect PIN. Please try again."); // Show an error message
        setPin(["", "", "", ""]); // Reset the PIN
      }
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      navigate("/home");
      // navigate("/addtransaction");
    }
  }, [isUnlocked, navigate]);

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      {/* Main Content */}
      <div className="w-full max-w-sm flex flex-col items-center gap-6 sm:gap-8">
        {/* Wallet Icon */}
        <div className="bg-blue-500 rounded-3xl p-4 sm:p-6">
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h6v2h-6z" />
          </svg>
        </div>

        {/* Welcome Text */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Enter your PIN to access your finances
          </p>
        </div>

        {/* PIN Input Fields */}
        <div className="flex gap-3 sm:gap-4">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password" // Keeps the input hidden
              inputMode="numeric" // Ensures numeric keypad on mobile devices
              maxLength="1"
              value={digit}
              onChange={(e) => handlePinInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-lg sm:text-xl font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
              placeholder="•"
            />
          ))}
        </div>

        {/* Unlock Button */}
        <button
          onClick={handleUnlock}
          disabled={!pin.every((digit) => digit !== "")}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-xl transition duration-200 text-sm sm:text-base"
        >
          Unlock Dashboard
        </button>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500 cursor-pointer transition text-xs sm:text-sm">
    <span className="text-lg sm:text-2xl">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </div>
);

export default LockScreen;
