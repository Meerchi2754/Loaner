import { db } from "./appDB";

export async function seedDatabase() {
  try {
    // ---- Seed Categories ----
    const categoryCount = await db.categories.count();
    if (categoryCount === 0) {
      const newISODate = new Date().toISOString();
      const categories = [
        { name: "Food", createdAt: newISODate },
        { name: "Travel", createdAt: newISODate },
        { name: "Bills", createdAt: newISODate },
        { name: "Shopping", createdAt: newISODate },
        { name: "Salary", createdAt: newISODate },
        { name: "Rapido", createdAt: newISODate },
      ];

      await db.categories.bulkAdd(categories);
      console.log("✅ Categories seeded");
    } else {
      console.log("ℹ️ Categories already exist, skipping seeding...");
    }

    // ---- Seed Transactions ----
    const txCount = await db.transactions.count();
    if (txCount === 0) {
      const now = new Date();
      const todayDate = now.toISOString().slice(0, 10);
      const nowTime = now.toTimeString().slice(0, 5);

      const sampleTransactions = [
        {
          type: "Expense",
          amount: 250,
          categoryId: 1, // Food
          subcategoryName: "Lunch",
          paymentMethod: "Cash",
          date: todayDate,
          time: nowTime,
          note: "Office lunch",
          createdAt: new Date().toISOString(),
        },
        {
          type: "Expense",
          amount: 1200.5,
          categoryId: 2, // Travel
          subcategoryName: "Fuel",
          paymentMethod: "Card",
          date: todayDate,
          time: nowTime,
          note: "Filled fuel",
          createdAt: new Date().toISOString(),
        },
        {
          type: "Income",
          amount: 50000,
          categoryId: 5, // Salary
          subcategoryName: "Monthly salary",
          paymentMethod: "Bank",
          date: todayDate,
          time: nowTime,
          note: "Monthly salary credited",
          createdAt: new Date().toISOString(),
        },
        {
          type: "Expense",
          amount: 20,
          categoryId: 1, // Food
          subcategoryName: "Biscuit",
          paymentMethod: "UPI",
          date: todayDate,
          time: nowTime,
          note: "Parle G biscuits, Monaco",
          createdAt: new Date().toISOString(),
        },
        {
          type: "Expense",
          amount: 20,
          categoryId: 1, // Food
          subcategoryName: "Dahi",
          paymentMethod: "UPI",
          date: todayDate,
          time: nowTime,
          note: "Parle G biscuits, Monaco",
          createdAt: "2026-01-15T10:15:16.152Z",
        },
      ];

      console.log("Seeding Started: Adding sample transactions...");
      await db.transactions.bulkAdd(sampleTransactions);
      console.log("✅ Transactions seeded");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
}
