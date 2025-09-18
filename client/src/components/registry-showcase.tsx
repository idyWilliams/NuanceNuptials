import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "./product-card";

const sampleProducts = [
  {
    id: "1",
    name: "Professional Stand Mixer",
    description: "KitchenAid Artisan Series",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    currentAmount: 285,
    targetAmount: 399,
    contributorCount: 12,
  },
  {
    id: "2", 
    name: "Elegant Dinnerware Set",
    description: "12-piece porcelain collection",
    price: 599,
    imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    currentAmount: 420,
    targetAmount: 599,
    contributorCount: 8,
  },
  {
    id: "3",
    name: "Smart Home Hub", 
    description: "Complete automation system",
    price: 249,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    currentAmount: 249,
    targetAmount: 249,
    contributorCount: 6,
    isCompleted: true,
  },
  {
    id: "4",
    name: "Romantic Getaway",
    description: "3-night luxury resort stay", 
    price: 1299,
    imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&w=400&h=300&fit=crop",
    currentAmount: 450,
    targetAmount: 1299,
    contributorCount: 15,
  },
];

const categories = [
  { id: "all", label: "All Categories" },
  { id: "home", label: "Home & Kitchen" },
  { id: "electronics", label: "Electronics" },
  { id: "experiences", label: "Experiences" },
  { id: "decor", label: "Decor" },
];

export default function RegistryShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <section className="py-20" data-testid="registry-showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">
            Beautiful Registry Experience
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated products from top brands with seamless group gifting functionality.
          </p>
        </div>
        
        {/* Registry Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                selectedCategory === category.id 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`button-category-${category.id}`}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* Shopping Cart Preview */}
        <Card className="shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-secondary">Your Contributions</h3>
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">3 items</span>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div>
                    <p className="font-medium">Stand Mixer Contribution</p>
                    <p className="text-sm text-muted-foreground">$25 toward group gift</p>
                  </div>
                </div>
                <p className="font-semibold">$25.00</p>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div>
                    <p className="font-medium">Dinnerware Set Contribution</p>
                    <p className="text-sm text-muted-foreground">$50 toward group gift</p>
                  </div>
                </div>
                <p className="font-semibold">$50.00</p>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div>
                    <p className="font-medium">Getaway Experience</p>
                    <p className="text-sm text-muted-foreground">$100 toward experience fund</p>
                  </div>
                </div>
                <p className="font-semibold">$100.00</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-4 border-t border-border">
              <span className="text-lg font-bold text-secondary">Total</span>
              <span className="text-xl font-bold text-secondary">$175.00</span>
            </div>
            
            <Button 
              className="w-full px-6 py-4 text-lg font-semibold shadow-lg"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-proceed-checkout"
            >
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
