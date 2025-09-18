import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Award } from "lucide-react";

interface VendorCardProps {
  vendor: {
    id: string;
    businessName: string;
    category: string;
    location: string;
    rating: number;
    reviewCount: number;
    startingPrice: number;
    imageUrl: string;
    description: string;
    isFeatured?: boolean;
    isVerified?: boolean;
    maxGuests?: number;
    experience?: string;
    isPremium?: boolean;
  };
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const getBadge = () => {
    if (vendor.isFeatured) return { text: "FEATURED", className: "vendor-badge text-white" };
    if (vendor.isPremium) return { text: "PREMIUM", className: "bg-secondary text-secondary-foreground" };
    if (vendor.isVerified) return { text: "VERIFIED", className: "bg-primary/20 text-primary" };
    return null;
  };

  const badge = getBadge();

  return (
    <Card className="card-hover border-border shadow-sm" data-testid={`card-vendor-${vendor.id}`}>
      <img 
        src={vendor.imageUrl} 
        alt={`${vendor.businessName} portfolio`}
        className="w-full h-48 object-cover rounded-t-lg"
        data-testid={`img-vendor-${vendor.id}`}
      />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg text-secondary" data-testid={`text-vendor-name-${vendor.id}`}>
              {vendor.businessName}
            </h3>
            <p className="text-sm text-muted-foreground">{vendor.category}</p>
          </div>
          {badge && (
            <Badge className={`text-xs ${badge.className}`}>
              {badge.text}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-semibold" data-testid={`text-vendor-rating-${vendor.id}`}>
              {vendor.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({vendor.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{vendor.location}</span>
          </div>
        </div>
        
        {/* Additional info based on vendor type */}
        <div className="flex items-center space-x-4 mb-4 text-xs text-muted-foreground">
          {vendor.maxGuests && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>Up to {vendor.maxGuests} guests</span>
            </div>
          )}
          {vendor.experience && (
            <div className="flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>{vendor.experience}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3" data-testid={`text-vendor-description-${vendor.id}`}>
          {vendor.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Starting from</span>
          <span className="text-lg font-bold text-secondary" data-testid={`text-vendor-price-${vendor.id}`}>
            ${vendor.startingPrice.toLocaleString()}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            data-testid={`button-view-portfolio-${vendor.id}`}
          >
            {vendor.category.toLowerCase() === 'venue' ? 'Virtual Tour' : 'View Portfolio'}
          </Button>
          <Button 
            className="flex-1"
            data-testid={`button-get-quote-${vendor.id}`}
          >
            {vendor.category.toLowerCase() === 'venue' ? 'Check Dates' : 
             vendor.category.toLowerCase() === 'planner' ? 'Consult' : 'Get Quote'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
