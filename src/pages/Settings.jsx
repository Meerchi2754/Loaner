import React, { useState, useEffect } from "react";
import BottomNav from "../component/BottomNav";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { jsPDF } from "jspdf";
import { db } from "../db/appDB";
import { passwordChanger } from "../features/userSlice";
import { addCategories } from "../features/categorySlice";

export default function Settings() {
  const dispatch = useDispatch();
  const transactions = useSelector(
    (state) => state.transaction.transactions || [],
  );
  const currentTheme = useSelector((state) => state.user.theme); // Get the current theme
  const currentMonth = new Date().getMonth(); // Get the current month (0-indexed)
  const currentPassword = useSelector((state) => state.user.password);
  const password = useSelector((state) => state.user.password);
  const categories = useSelector((state) => state.category.categories || []); // Fetch categories from Redux
  const [isAddingCategory, setIsAddingCategory] = useState(false); // Toggle for Add Category
  const [newCategoryName, setNewCategoryName] = useState(""); // State for category name
  const [newCategoryIcon, setNewCategoryIcon] = useState(""); // State for category icon
  useEffect(() => {
    console.log("Updated password:", password);
  }, [password]); // Get the current password
  const [isChangingPassword, setIsChangingPassword] = useState(false); // State to toggle password input
  const [newPassword, setNewPassword] = useState(""); // State to store the new password

  // Handle Export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Transaction History", 10, 10);

    // Filter transactions for the current month
    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth;
    });

    if (filteredTransactions.length === 0) {
      toast.error("No transactions found for the current month.");
      return;
    }

    // Add transactions to the PDF
    let y = 20;
    filteredTransactions.forEach((transaction, index) => {
      doc.text(
        `${index + 1}. ${transaction.date} - ${transaction.description} - ₹${transaction.amount}`,
        10,
        y,
      );
      y += 10;
    });

    // Save the PDF
    doc.save("Transaction_History.pdf");
    toast.success("Transaction history exported to PDF!");
  };

  // Handle Reset Database Transactions
  const handleResetTransactions = () => {
    db.transactions.clear();
    toast.success("All transactions have been reset!");
  };

  // Handle Change Password
  const handlePasswordChange = () => {
    if (newPassword.trim().length < 4) {
      toast.error("Password must be at least 4 characters long.");
      return;
    }

    dispatch(passwordChanger({ password: newPassword })); // Dispatch the new password
    toast.success("Password changed successfully!");
    setIsChangingPassword(false); // Hide the input field
    setNewPassword(""); // Clear the input field
  };
  const handleAddCategory = async () => {
    // if (!newCategoryName.trim() || !newCategoryIcon.trim()) {
    //   toast.error("Please fill out both fields.");
    //   return;
    // }

    try {
      console.log("categories length:", categories.length);
      const nextId =
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1;
      const newCategory = {
        id: nextId,
        name: newCategoryName.trim(),
        icon: newCategoryIcon.trim(),
        createdAt: new Date().toISOString(),
      };

      //await db.categories.add(newCategory);
      dispatch(addCategories(newCategory));
      toast.success("Category added successfully!");

      // Reset form
      setIsAddingCategory(false);
      setNewCategoryName("");
      setNewCategoryIcon("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category");
    }
  };

  return (
    <>
      <div
        className={`min-h-screen ${currentTheme === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"} p-4 pt-16`}
      >
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl font-bold text-white">
            {/* Placeholder for Profile Photo */}
            <span>M</span>
          </div>
          <h2 className="text-xl font-bold mt-4">Meetraj Parmar</h2>
          <p className="text-gray-400 text-sm">meet@email.com</p>
        </div>

        {/* Settings Options */}
        <div className="space-y-6">
          {/* Export to PDF */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Export Transactions
            </h3>
            <button
              onClick={handleExportToPDF}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-200"
            >
              Export to PDF
            </button>
          </div>

          {/* Reset Database Transactions */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Reset Transactions
            </h3>
            <button
              onClick={handleResetTransactions}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-200"
            >
              Reset Database
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Change Password
            </h3>
            {isChangingPassword ? (
              <div className="flex flex-col gap-4">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handlePasswordChange}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  Save Password
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword("");
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-200"
              >
                Change Password
              </button>
            )}
          </div>
          {/* Add Category */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Add Category
            </h3>
            {isAddingCategory ? (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  placeholder="Enter category icon (e.g., 🍔)"
                  className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddCategory}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  Add Category
                </button>
                <button
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                    setNewCategoryIcon("");
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition duration-200"
              >
                Add Category
              </button>
            )}
          </div>

          {/* Additional Features */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Additional Features
            </h3>
            <ul className="list-disc list-inside text-gray-400">
              <li>Change Password</li>
              <li>Enable/Disable Notifications</li>
              <li>Privacy Settings</li>
              <li>About the App</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
