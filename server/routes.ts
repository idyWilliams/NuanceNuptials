import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertEventSchema,
  insertRegistryItemSchema,
  insertContributionSchema,
  insertVendorSchema,
  insertGuestSchema,
  insertTimelineItemSchema 
} from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertEventSchema.parse({ ...req.body, userId });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getProducts(
        category as string,
        search as string
      );
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Registry routes
  app.post('/api/registry-items', isAuthenticated, async (req: any, res) => {
    try {
      const registryData = insertRegistryItemSchema.parse(req.body);
      const registryItem = await storage.createRegistryItem(registryData);
      res.json(registryItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/events/:eventId/registry', async (req, res) => {
    try {
      const registryItems = await storage.getRegistryItems(req.params.eventId);
      res.json(registryItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/registry-items/:id', async (req, res) => {
    try {
      const item = await storage.getRegistryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Registry item not found" });
      }
      res.json(item);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Contribution routes
  app.post('/api/contributions', async (req, res) => {
    try {
      const contributionData = insertContributionSchema.parse(req.body);
      const contribution = await storage.createContribution(contributionData);
      res.json(contribution);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/registry-items/:id/contributions', async (req, res) => {
    try {
      const contributions = await storage.getContributions(req.params.id);
      res.json(contributions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vendor routes
  app.post('/api/vendors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendorData = insertVendorSchema.parse({ ...req.body, userId });
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/vendors', async (req, res) => {
    try {
      const { category, location } = req.query;
      const vendors = await storage.getVendors(
        category as string,
        location as string
      );
      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/vendors/:id', async (req, res) => {
    try {
      const vendor = await storage.getVendor(req.params.id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/my-vendor', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getUserVendor(userId);
      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vendor portfolio routes
  app.post('/api/vendors/:id/portfolio', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const vendorId = req.params.id;
      const userId = req.user.claims.sub;
      
      // Verify the vendor belongs to the authenticated user
      const vendor = await storage.getVendor(vendorId);
      if (!vendor || vendor.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      // In a real app, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, we'll just simulate the image URL
      const imageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=800&h=600`;
      
      await storage.addPortfolioImage(vendorId, imageUrl, req.body.caption);
      res.json({ imageUrl });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/vendors/:id/portfolio', async (req, res) => {
    try {
      const portfolio = await storage.getVendorPortfolio(req.params.id);
      res.json(portfolio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Review routes
  app.post('/api/vendors/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const vendorId = req.params.id;
      const userId = req.user.claims.sub;
      const { rating, title, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const review = await storage.createReview(vendorId, userId, rating, title, comment);
      res.json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/vendors/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getVendorReviews(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Guest routes
  app.post('/api/events/:eventId/guests', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = req.params.eventId;
      const guestData = insertGuestSchema.parse({ ...req.body, eventId });
      const guest = await storage.addGuest(guestData);
      res.json(guest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const guests = await storage.getEventGuests(req.params.eventId);
      res.json(guests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/guests/:id/rsvp', async (req, res) => {
    try {
      const { status } = req.body;
      if (!['confirmed', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid RSVP status" });
      }
      
      const guest = await storage.updateGuestRsvp(req.params.id, status);
      res.json(guest);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Timeline routes
  app.post('/api/events/:eventId/timeline', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = req.params.eventId;
      const timelineData = insertTimelineItemSchema.parse({ ...req.body, eventId });
      const timelineItem = await storage.createTimelineItem(timelineData);
      res.json(timelineItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/events/:eventId/timeline', async (req, res) => {
    try {
      const timeline = await storage.getEventTimeline(req.params.eventId);
      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Booking routes
  app.post('/api/vendors/:vendorId/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const vendorId = req.params.vendorId;
      const userId = req.user.claims.sub;
      const { eventId, serviceDate, notes } = req.body;

      if (!eventId || !serviceDate) {
        return res.status(400).json({ message: "Event ID and service date are required" });
      }

      const booking = await storage.createBooking(vendorId, eventId, userId, new Date(serviceDate), notes);
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/my-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vendor = await storage.getUserVendor(userId);
      
      if (!vendor) {
        return res.json([]);
      }

      const bookings = await storage.getVendorBookings(vendor.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { status, price } = req.body;
      const booking = await storage.updateBookingStatus(req.params.id, status, price);
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, metadata } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: metadata || {},
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook to handle successful payments
  app.post('/api/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }
    
    try {
      const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Update contribution status
        if (paymentIntent.metadata.contributionId) {
          await storage.updateContributionStatus(paymentIntent.metadata.contributionId, 'completed');
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
