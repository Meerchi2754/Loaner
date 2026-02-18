import { db } from "./appDB";

export async function seedDatabase() {
  try {
    // ---- Seed Categories ----
    const categoryCount = await db.categories.count();
    let categoryIds = [];
    const newISODate = new Date().toISOString();
    if (categoryCount === 0) {
      const categories = [
        { name: "Food", createdAt: newISODate },
        { name: "Travel", createdAt: newISODate },
        { name: "Bills", createdAt: newISODate },
        { name: "Shopping", createdAt: newISODate },
        { name: "Salary", createdAt: newISODate },
        { name: "Rapido", createdAt: newISODate },
      ];

      categoryIds = await db.categories.bulkAdd(categories, { allKeys: true });
      console.log("✅ Categories seeded");
    } else {
      // If already seeded, fetch category ids in same order
      console.log("ℹ️ Categories already exist, fetching IDs...");
      const allCategories = await db.categories.toArray();
      categoryIds = allCategories.map((c) => c.id);
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
          categoryId: categoryIds[0], // Food
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
          categoryId: categoryIds[1], // Travel
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
          categoryId: categoryIds[4], // Salary
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
          categoryId: categoryIds[0], // Food
          subcategoryName: "Biscuit",
          paymentMethod: "UPI",
          date: todayDate,
          time: nowTime,
          note: "Parle G biscuits,Monaco",
          createdAt: new Date().toISOString(),
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
