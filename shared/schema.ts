import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["celebrant", "guest", "vendor"] }).default("guest"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  venue: varchar("venue"),
  address: text("address"),
  maxGuests: integer("max_guests"),
  status: varchar("status", { enum: ["planning", "active", "completed", "cancelled"] }).default("planning"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories: any = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  brand: varchar("brand"),
  categoryId: uuid("category_id").references(() => categories.id),
  isAvailable: boolean("is_available").default(true),
  stockQuantity: integer("stock_quantity").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Registry items
export const registryItems = pgTable("registry_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  priority: varchar("priority", { enum: ["high", "medium", "low"] }).default("medium"),
  isPublic: boolean("is_public").default(true),
  isPurchased: boolean("is_purchased").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Guest list
export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  email: varchar("email").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  rsvpStatus: varchar("rsvp_status", { enum: ["pending", "confirmed", "declined"] }).default("pending"),
  invitationSent: boolean("invitation_sent").default(false),
  plusOneAllowed: boolean("plus_one_allowed").default(false),
  plusOneRsvp: varchar("plus_one_rsvp", { enum: ["pending", "confirmed", "declined"] }),
  dietaryRestrictions: text("dietary_restrictions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gift contributions
export const contributions = pgTable("contributions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  registryItemId: uuid("registry_item_id").references(() => registryItems.id).notNull(),
  contributorEmail: varchar("contributor_email").notNull(),
  contributorName: varchar("contributor_name"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  isAnonymous: boolean("is_anonymous").default(false),
  paymentIntentId: varchar("payment_intent_id"),
  status: varchar("status", { enum: ["pending", "completed", "failed", "refunded"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  description: text("description"),
  category: varchar("category", { 
    enum: ["photographer", "venue", "caterer", "planner", "dj", "florist", "baker", "musician", "videographer", "decorator"] 
  }).notNull(),
  location: varchar("location"),
  website: varchar("website"),
  phone: varchar("phone"),
  startingPrice: decimal("starting_price", { precision: 10, scale: 2 }),
  isVerified: boolean("is_verified").default(false),
  isFeatured: boolean("is_featured").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor portfolio images
export const vendorPortfolio = pgTable("vendor_portfolio", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  imageUrl: varchar("image_url").notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendor reviews
export const vendorReviews = pgTable("vendor_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: uuid("event_id").references(() => events.id),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  comment: text("comment"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor bookings
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: uuid("vendor_id").references(() => vendors.id).notNull(),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  serviceDate: timestamp("service_date").notNull(),
  duration: integer("duration"), // in hours
  price: decimal("price", { precision: 10, scale: 2 }),
  status: varchar("status", { enum: ["inquiry", "quoted", "booked", "confirmed", "completed", "cancelled"] }).default("inquiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event timeline items
export const timelineItems = pgTable("timeline_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid("event_id").references(() => events.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration"), // in minutes
  category: varchar("category"),
  isCompleted: boolean("is_completed").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  vendors: many(vendors),
  reviews: many(vendorReviews),
  bookings: many(bookings),
  guestEntries: many(guests),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  user: one(users, { fields: [events.userId], references: [users.id] }),
  registryItems: many(registryItems),
  guests: many(guests),
  bookings: many(bookings),
  timelineItems: many(timelineItems),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  registryItems: many(registryItems),
}));

export const registryItemsRelations = relations(registryItems, ({ one, many }) => ({
  event: one(events, { fields: [registryItems.eventId], references: [events.id] }),
  product: one(products, { fields: [registryItems.productId], references: [products.id] }),
  contributions: many(contributions),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  registryItem: one(registryItems, { fields: [contributions.registryItemId], references: [registryItems.id] }),
}));

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(users, { fields: [vendors.userId], references: [users.id] }),
  portfolio: many(vendorPortfolio),
  reviews: many(vendorReviews),
  bookings: many(bookings),
}));

export const vendorPortfolioRelations = relations(vendorPortfolio, ({ one }) => ({
  vendor: one(vendors, { fields: [vendorPortfolio.vendorId], references: [vendors.id] }),
}));

export const vendorReviewsRelations = relations(vendorReviews, ({ one }) => ({
  vendor: one(vendors, { fields: [vendorReviews.vendorId], references: [vendors.id] }),
  user: one(users, { fields: [vendorReviews.userId], references: [users.id] }),
  event: one(events, { fields: [vendorReviews.eventId], references: [events.id] }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  vendor: one(vendors, { fields: [bookings.vendorId], references: [vendors.id] }),
  event: one(events, { fields: [bookings.eventId], references: [events.id] }),
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
}));

export const guestsRelations = relations(guests, ({ one }) => ({
  event: one(events, { fields: [guests.eventId], references: [events.id] }),
  user: one(users, { fields: [guests.userId], references: [users.id] }),
}));

export const timelineItemsRelations = relations(timelineItems, ({ one }) => ({
  event: one(events, { fields: [timelineItems.eventId], references: [events.id] }),
}));

// Export schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRegistryItemSchema = createInsertSchema(registryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContributionSchema = createInsertSchema(contributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimelineItemSchema = createInsertSchema(timelineItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Product = typeof products.$inferSelect;
export type RegistryItem = typeof registryItems.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type VendorReview = typeof vendorReviews.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type TimelineItem = typeof timelineItems.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Booking = typeof bookings.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertRegistryItem = z.infer<typeof insertRegistryItemSchema>;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type InsertTimelineItem = z.infer<typeof insertTimelineItemSchema>;
