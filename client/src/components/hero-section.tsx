import { Button } from "@/components/ui/button";
import { Star, Shield } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="hero-gradient py-20 lg:py-32" data-testid="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-secondary leading-tight" data-testid="text-hero-title">
                Your Dream Wedding,
                <span className="text-primary"> Simplified</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg" data-testid="text-hero-description">
                Create beautiful registries, discover amazing vendors, and manage every detail of your special day in one elegant platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold shadow-lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-create-registry"
              >
                Create Registry
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold border-border"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-explore-vendors"
              >
                Explore Vendors
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span>5,000+ Happy Couples</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
              alt="Happy wedding couple" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-hero"
            />
            
            {/* Floating cards for visual appeal */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">🎁</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Registry Goal</p>
                  <p className="text-xs text-muted-foreground">85% Complete</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-lg border border-border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-primary text-xl">👥</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">RSVP Status</p>
                  <p className="text-xs text-muted-foreground">142 Confirmed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
