import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  game: text("game").notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  inStock: boolean("in_stock").notNull().default(true),
  imageUrl: text("image_url").notNull(),
  deliveryUrl: text("delivery_url"), // Download link or file path
  licenseKey: text("license_key"), // For software licenses
  deliveryType: text("delivery_type").notNull().default("download"), // "download", "key", "account"
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Product groups for variants
export type ProductVariant = {
  id: string;
  name: string;
  price: string;
  originalPrice?: string | null;
  stockQuantity: number;
  inStock: boolean;
  deliveryUrl?: string | null;
  licenseKey?: string | null;
};

export type ProductGroup = {
  id: string;
  name: string;
  description: string;
  category: string;
  game: string;
  imageUrl: string;
  deliveryType: string;
  variants: ProductVariant[];
};

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Support tickets
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  status: text("status").notNull().default("open"), // "open", "in_progress", "resolved", "closed"
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
