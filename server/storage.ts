import {
  users,
  events,
  products,
  categories,
  registryItems,
  contributions,
  vendors,
  vendorPortfolio,
  vendorReviews,
  guests,
  timelineItems,
  bookings,
  type User,
  type UpsertUser,
  type Event,
  type Product,
  type RegistryItem,
  type Contribution,
  type Vendor,
  type VendorReview,
  type Guest,
  type TimelineItem,
  type Category,
  type Booking,
  type InsertEvent,
  type InsertProduct,
  type InsertRegistryItem,
  type InsertContribution,
  type InsertVendor,
  type InsertGuest,
  type InsertTimelineItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, like, or, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: string): Promise<Event | undefined>;
  getUserEvents(userId: string): Promise<Event[]>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event>;

  // Product operations
  getProducts(categoryId?: string, search?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getCategories(): Promise<Category[]>;

  // Registry operations
  createRegistryItem(item: InsertRegistryItem): Promise<RegistryItem>;
  getRegistryItems(eventId: string): Promise<(RegistryItem & { product: Product })[]>;
  getRegistryItem(id: string): Promise<(RegistryItem & { product: Product }) | undefined>;
  updateRegistryItem(id: string, updates: Partial<InsertRegistryItem>): Promise<RegistryItem>;

  // Contribution operations
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  getContributions(registryItemId: string): Promise<Contribution[]>;
  updateContributionStatus(id: string, status: string): Promise<Contribution>;

  // Vendor operations
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendors(category?: string, location?: string): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  getUserVendor(userId: string): Promise<Vendor | undefined>;
  updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor>;

  // Portfolio operations
  addPortfolioImage(vendorId: string, imageUrl: string, caption?: string): Promise<void>;
  getVendorPortfolio(vendorId: string): Promise<any[]>;

  // Review operations
  createReview(vendorId: string, userId: string, rating: number, title?: string, comment?: string): Promise<VendorReview>;
  getVendorReviews(vendorId: string): Promise<VendorReview[]>;

  // Guest operations
  addGuest(guest: InsertGuest): Promise<Guest>;
  getEventGuests(eventId: string): Promise<Guest[]>;
  updateGuestRsvp(id: string, status: string): Promise<Guest>;

  // Timeline operations
  createTimelineItem(item: InsertTimelineItem): Promise<TimelineItem>;
  getEventTimeline(eventId: string): Promise<TimelineItem[]>;
  updateTimelineItem(id: string, updates: Partial<InsertTimelineItem>): Promise<TimelineItem>;

  // Booking operations
  createBooking(vendorId: string, eventId: string, userId: string, serviceDate: Date, notes?: string): Promise<Booking>;
  getVendorBookings(vendorId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string, price?: number): Promise<Booking>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.userId, userId)).orderBy(desc(events.createdAt));
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  // Product operations
  async getProducts(categoryId?: string, search?: string): Promise<Product[]> {
    let query = db.select().from(products);
    let conditions = [eq(products.isAvailable, true)];
    
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      );
    }

    return await query.where(and(...conditions)).orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  // Registry operations
  async createRegistryItem(item: InsertRegistryItem): Promise<RegistryItem> {
    const [registryItem] = await db.insert(registryItems).values(item).returning();
    return registryItem;
  }

  async getRegistryItems(eventId: string): Promise<(RegistryItem & { product: Product })[]> {
    return await db
      .select({
        id: registryItems.id,
        eventId: registryItems.eventId,
        productId: registryItems.productId,
        targetAmount: registryItems.targetAmount,
        currentAmount: registryItems.currentAmount,
        priority: registryItems.priority,
        isPublic: registryItems.isPublic,
        isPurchased: registryItems.isPurchased,
        createdAt: registryItems.createdAt,
        updatedAt: registryItems.updatedAt,
        product: products,
      })
      .from(registryItems)
      .leftJoin(products, eq(registryItems.productId, products.id))
      .where(and(eq(registryItems.eventId, eventId), eq(registryItems.isPublic, true)))
      .orderBy(registryItems.priority, registryItems.createdAt);
  }

  async getRegistryItem(id: string): Promise<(RegistryItem & { product: Product }) | undefined> {
    const [item] = await db
      .select({
        id: registryItems.id,
        eventId: registryItems.eventId,
        productId: registryItems.productId,
        targetAmount: registryItems.targetAmount,
        currentAmount: registryItems.currentAmount,
        priority: registryItems.priority,
        isPublic: registryItems.isPublic,
        isPurchased: registryItems.isPurchased,
        createdAt: registryItems.createdAt,
        updatedAt: registryItems.updatedAt,
        product: products,
      })
      .from(registryItems)
      .leftJoin(products, eq(registryItems.productId, products.id))
      .where(eq(registryItems.id, id));
    return item;
  }

  async updateRegistryItem(id: string, updates: Partial<InsertRegistryItem>): Promise<RegistryItem> {
    const [item] = await db
      .update(registryItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(registryItems.id, id))
      .returning();
    return item;
  }

  // Contribution operations
  async createContribution(contribution: InsertContribution): Promise<Contribution> {
    const [newContribution] = await db.insert(contributions).values(contribution).returning();
    
    // Update registry item current amount
    await db
      .update(registryItems)
      .set({
        currentAmount: sql`${registryItems.currentAmount} + ${contribution.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(registryItems.id, contribution.registryItemId));

    return newContribution;
  }

  async getContributions(registryItemId: string): Promise<Contribution[]> {
    return await db
      .select()
      .from(contributions)
      .where(eq(contributions.registryItemId, registryItemId))
      .orderBy(desc(contributions.createdAt));
  }

  async updateContributionStatus(id: string, status: "pending" | "completed" | "failed" | "refunded"): Promise<Contribution> {
    const [contribution] = await db
      .update(contributions)
      .set({ status, updatedAt: new Date() })
      .where(eq(contributions.id, id))
      .returning();
    return contribution;
  }

  // Vendor operations
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async getVendors(category?: string, location?: string): Promise<Vendor[]> {
    let query = db.select().from(vendors);
    
    const conditions = [];
    if (category) {
      conditions.push(eq(vendors.category, category));
    }
    if (location) {
      conditions.push(like(vendors.location, `%${location}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(vendors.isFeatured), desc(vendors.rating), vendors.businessName);
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getUserVendor(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor;
  }

  async updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor> {
    const [vendor] = await db
      .update(vendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return vendor;
  }

  // Portfolio operations
  async addPortfolioImage(vendorId: string, imageUrl: string, caption?: string): Promise<void> {
    await db.insert(vendorPortfolio).values({
      vendorId,
      imageUrl,
      caption,
    });
  }

  async getVendorPortfolio(vendorId: string): Promise<any[]> {
    return await db
      .select()
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, vendorId))
      .orderBy(vendorPortfolio.displayOrder, vendorPortfolio.createdAt);
  }

  // Review operations
  async createReview(vendorId: string, userId: string, rating: number, title?: string, comment?: string): Promise<VendorReview> {
    const [review] = await db
      .insert(vendorReviews)
      .values({
        vendorId,
        userId,
        rating,
        title,
        comment,
      })
      .returning();

    // Update vendor rating
    const { avgRating, count } = await db
      .select({
        avgRating: sql<number>`AVG(${vendorReviews.rating})::decimal`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(vendorReviews)
      .where(eq(vendorReviews.vendorId, vendorId))
      .then(result => result[0]);

    await db
      .update(vendors)
      .set({
        rating: avgRating.toString(),
        reviewCount: count,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId));

    return review;
  }

  async getVendorReviews(vendorId: string): Promise<VendorReview[]> {
    return await db
      .select()
      .from(vendorReviews)
      .where(eq(vendorReviews.vendorId, vendorId))
      .orderBy(desc(vendorReviews.createdAt));
  }

  // Guest operations
  async addGuest(guest: InsertGuest): Promise<Guest> {
    const [newGuest] = await db.insert(guests).values(guest).returning();
    return newGuest;
  }

  async getEventGuests(eventId: string): Promise<Guest[]> {
    return await db
      .select()
      .from(guests)
      .where(eq(guests.eventId, eventId))
      .orderBy(guests.firstName, guests.lastName);
  }

  async updateGuestRsvp(id: string, status: "pending" | "confirmed" | "declined"): Promise<Guest> {
    const [guest] = await db
      .update(guests)
      .set({ rsvpStatus: status, updatedAt: new Date() })
      .where(eq(guests.id, id))
      .returning();
    return guest;
  }

  // Timeline operations
  async createTimelineItem(item: InsertTimelineItem): Promise<TimelineItem> {
    const [timelineItem] = await db.insert(timelineItems).values(item).returning();
    return timelineItem;
  }

  async getEventTimeline(eventId: string): Promise<TimelineItem[]> {
    return await db
      .select()
      .from(timelineItems)
      .where(eq(timelineItems.eventId, eventId))
      .orderBy(timelineItems.startTime, timelineItems.displayOrder);
  }

  async updateTimelineItem(id: string, updates: Partial<InsertTimelineItem>): Promise<TimelineItem> {
    const [item] = await db
      .update(timelineItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(timelineItems.id, id))
      .returning();
    return item;
  }

  // Booking operations
  async createBooking(vendorId: string, eventId: string, userId: string, serviceDate: Date, notes?: string): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values({
        vendorId,
        eventId,
        userId,
        serviceDate,
        notes,
      })
      .returning();
    return booking;
  }

  async getVendorBookings(vendorId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.vendorId, vendorId))
      .orderBy(desc(bookings.serviceDate));
  }

  async updateBookingStatus(id: string, status: string, price?: number): Promise<Booking> {
    const updates: any = { status, updatedAt: new Date() };
    if (price !== undefined) {
      updates.price = price.toString();
    }

    const [booking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }
}

export const storage = new DatabaseStorage();
