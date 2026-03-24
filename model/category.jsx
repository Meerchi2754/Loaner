import { db } from "../db/appDB";

/* Default Categories */
export const defaultCategories = [
  { id: 1, name: "Food", icon: "🍔" },
  { id: 2, name: "Travel", icon: "✈️" },
  { id: 3, name: "Bills", icon: "💡" },
  { id: 4, name: "Shopping", icon: "🛍️" },
  { id: 5, name: "Salary", icon: "💰" },
  { id: 6, name: "Rapido", icon: "🛵" },
  { id: 7, name: "Others", icon: "📦" },
  { id: 8, name: "Service", icon: "🛠️" },
];

/* ---------------- ADD CATEGORY FUNCTION ---------------- */

export const addCategory = async (name, icon, dispatch, setCategories) => {
  if (!name.trim() || !icon.trim()) {
    throw new Error("Category name and icon are required");
  }

  try {
    // Check duplicate
    const existing = await db.categories
      .where("name")
      .equalsIgnoreCase(name.trim())
      .first();

    if (existing) {
      throw new Error("Category already exists");
    }

    const newCategory = {
      name: name.trim(),
      icon: icon.trim(),
      createdAt: new Date().toISOString(),
    };

    await db.categories.add(newCategory);

    // Get updated list
    const updatedCategories = await db.categories.toArray();

    // Update Redux
    dispatch(setCategories(updatedCategories));

    return updatedCategories;

  } catch (error) {
    throw error;
  }
};