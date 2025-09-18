import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import RegistryShowcase from "@/components/registry-showcase";
import VendorMarketplace from "@/components/vendor-marketplace";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Crown, 
  Gift, 
  Store, 
  Star, 
  Shield, 
  Instagram, 
  Facebook, 
  Twitter, 
  Heart 
} from "lucide-react";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <Navigation />
      
      <HeroSection />
      
      {/* User Role Dashboards Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">
              Designed for Everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're planning, gifting, or providing services, our platform adapts to your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Celebrant Dashboard */}
            <Card className="card-hover border-border shadow-sm" data-testid="card-celebrant">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Crown className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-4">For Celebrants</h3>
                <p className="text-muted-foreground mb-6">
                  Create beautiful registries, manage your guest list, and coordinate every aspect of your special day.
                </p>
                
                {/* Mini dashboard preview */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Registry Progress</span>
                    <span className="text-primary font-semibold">73%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="progress-bar h-2 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>42 gifts received</span>
                    <span>$3,240 raised</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-start-planning"
                >
                  Start Planning
                </Button>
              </CardContent>
            </Card>
            
            {/* Guest Dashboard */}
            <Card className="card-hover border-border shadow-sm" data-testid="card-guest">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6">
                  <Gift className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-4">For Guests</h3>
                <p className="text-muted-foreground mb-6">
                  Browse registries, contribute to group gifts, and RSVP to events with just a few clicks.
                </p>
                
                {/* Group gift preview */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&w=100&h=100&fit=crop" 
                      alt="Elegant dinnerware set" 
                      className="w-12 h-12 rounded-lg object-cover" 
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Luxury Dinnerware Set</p>
                      <p className="text-xs text-muted-foreground">Group Gift • 8 contributors</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">$420 of $599</span>
                    <span className="text-primary font-semibold">70%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div className="progress-bar h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-browse-gifts"
                >
                  Browse Gifts
                </Button>
              </CardContent>
            </Card>
            
            {/* Vendor Dashboard */}
            <Card className="card-hover border-border shadow-sm" data-testid="card-vendor">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                  <Store className="text-secondary text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-4">For Vendors</h3>
                <p className="text-muted-foreground mb-6">
                  Showcase your services, manage bookings, and connect with couples planning their dream day.
                </p>
                
                {/* Vendor stats */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-secondary">4.9</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-secondary">127</p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-join-marketplace"
                >
                  Join Marketplace
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <RegistryShowcase />
      
      <VendorMarketplace />

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="text-primary text-2xl" />
                <span className="font-serif font-bold text-xl">WeddingHub</span>
              </div>
              <p className="text-secondary-foreground/80 leading-relaxed">
                The complete platform for wedding planning, gifting, and vendor services. Making dream weddings accessible and stress-free.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-primary p-0">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-primary p-0">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-secondary-foreground/60 hover:text-primary p-0">
                  <Twitter className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">For Couples</h4>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li><a href="#" className="hover:text-primary transition-colors">Create Registry</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Plan Your Event</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Find Vendors</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Digital Invitations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Guest Management</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">For Guests</h4>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li><a href="#" className="hover:text-primary transition-colors">Browse Registries</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Group Gifting</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">RSVP to Events</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Gift Ideas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Order Tracking</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">For Vendors</h4>
              <ul className="space-y-2 text-secondary-foreground/80">
                <li><a href="#" className="hover:text-primary transition-colors">Join Marketplace</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Vendor Dashboard</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Portfolio Tools</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Booking Management</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Analytics</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-foreground/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-secondary-foreground/60 text-sm">
                © 2024 WeddingHub. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-secondary-foreground/60">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
