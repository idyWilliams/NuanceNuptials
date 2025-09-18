import { Button } from "@/components/ui/button";
import VendorCard from "./vendor-card";

const sampleVendors = [
  {
    id: "1",
    businessName: "Emma Rodriguez",
    category: "Wedding Photographer",
    location: "San Francisco, CA",
    rating: 4.9,
    reviewCount: 127,
    startingPrice: 2500,
    imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
    description: "Capturing love stories with artistic elegance. Specializing in intimate ceremonies and grand celebrations.",
    isFeatured: true,
  },
  {
    id: "2",
    businessName: "Rosewood Gardens",
    category: "Wedding Venue", 
    location: "Napa Valley, CA",
    rating: 4.8,
    reviewCount: 89,
    startingPrice: 8500,
    imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
    description: "Enchanting garden venue with century-old oak trees, perfect for outdoor ceremonies and receptions.",
    maxGuests: 200,
  },
  {
    id: "3", 
    businessName: "Sarah Chen",
    category: "Wedding Planner",
    location: "Los Angeles, CA",
    rating: 5.0,
    reviewCount: 156,
    startingPrice: 3200,
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
    description: "Full-service wedding planning with attention to every detail. From concept to execution, stress-free experience.",
    experience: "10+ years",
    isPremium: true,
  },
];

const vendorCategories = [
  { id: "all", label: "All Vendors" },
  { id: "photographer", label: "Photographers" },
  { id: "venue", label: "Venues" },
  { id: "caterer", label: "Caterers" },
  { id: "planner", label: "Planners" },
  { id: "dj", label: "Music & DJ" },
];

export default function VendorMarketplace() {
  return (
    <section className="py-20 bg-muted/30" data-testid="vendor-marketplace">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">
            Trusted Wedding Vendors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with top-rated professionals to make your wedding day perfect.
          </p>
        </div>
        
        {/* Vendor Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {vendorCategories.map((category) => (
            <Button
              key={category.id}
              variant={category.id === "all" ? "default" : "outline"}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                category.id === "all"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-card text-foreground hover:bg-accent border-border"
              }`}
              data-testid={`button-vendor-category-${category.id}`}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* Vendor Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {sampleVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
        
        {/* Vendor Application CTA */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Join Our Vendor Network</h3>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Connect with couples planning their dream weddings. Grow your business with our trusted marketplace platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary"
              className="px-8 py-4 bg-white text-secondary hover:bg-gray-50"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-become-vendor"
            >
              Become a Vendor
            </Button>
            <Button 
              variant="outline"
              className="px-8 py-4 border-white/30 text-white hover:bg-white/10"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
