import Dexie from "dexie";

export const db = new Dexie("Karazdar");
db.version(1).stores({
  categories: "++id, name, createdAt",
  subcategories: "++id, categoryId, name, createdAt",
  transactions:
    "++id, type, amount, categoryId, subCategoryId, paymentMethod, date, time, createdAt",
});
