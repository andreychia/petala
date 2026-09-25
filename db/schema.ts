import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull().default("Ramos"),
  season: text("season").notNull().default("Todo el año"),
  featured: integer("featured").notNull().default(0),
  active: integer("active").notNull().default(1),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
