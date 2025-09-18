import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import VendorCard from "@/components/vendor-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MapPin, Star, Filter, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { VENDOR_CATEGORIES } from "@/lib/constants";

const vendorSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number is required"),
  startingPrice: z.number().min(0, "Starting price must be 0 or greater"),
});

type VendorFormData = z.infer<typeof vendorSchema>;

export default function Vendors() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [isCreateVendorDialogOpen, setIsCreateVendorDialogOpen] = useState(false);

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      website: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ["/api/vendors", selectedCategory, locationFilter],
    enabled: isAuthenticated,
  });

  // Fetch user's vendor profile
  const { data: userVendor } = useQuery({
    queryKey: ["/api/my-vendor"],
    enabled: isAuthenticated,
  });

  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      return await apiRequest("POST", "/api/vendors", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor profile created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-vendor"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsCreateVendorDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create vendor profile",
        variant: "destructive",
      });
    },
  });

  const handleCreateVendor = (data: VendorFormData) => {
    createVendorMutation.mutate(data);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="vendors-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-secondary mb-2" data-testid="text-vendors-title">
              Wedding Vendors
            </h1>
            <p className="text-muted-foreground">
              Discover trusted professionals for your special day
            </p>
          </div>
          
          {!userVendor && (
            <Dialog open={isCreateVendorDialogOpen} onOpenChange={setIsCreateVendorDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0" data-testid="button-become-vendor">
                  <Plus className="h-4 w-4 mr-2" />
                  Become a Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Vendor Profile</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateVendor)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your business name" {...field} data-testid="input-business-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-vendor-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {VENDOR_CATEGORIES.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your services..."
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State" {...field} data-testid="input-location" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="startingPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Starting Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-starting-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourwebsite.com" {...field} data-testid="input-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createVendorMutation.isPending}
                      data-testid="button-submit-vendor"
                    >
                      {createVendorMutation.isPending ? "Creating..." : "Create Vendor Profile"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="pl-10"
                    data-testid="input-location-filter"
                  />
                </div>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {VENDOR_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
        {vendorsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : vendors && vendors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendors.map((vendor: any) => (
              <VendorCard
                key={vendor.id}
                vendor={{
                  id: vendor.id,
                  businessName: vendor.businessName,
                  category: VENDOR_CATEGORIES.find(c => c.value === vendor.category)?.label || vendor.category,
                  location: vendor.location,
                  rating: parseFloat(vendor.rating) || 0,
                  reviewCount: vendor.reviewCount,
                  startingPrice: parseFloat(vendor.startingPrice),
                  imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&w=400&h=250&fit=crop",
                  description: vendor.description,
                  isFeatured: vendor.isFeatured,
                  isVerified: vendor.isVerified,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="no-vendors">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-secondary mb-2">No vendors found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or check back later for new vendors.
            </p>
            {!userVendor && (
              <Button onClick={() => setIsCreateVendorDialogOpen(true)} data-testid="button-become-vendor-empty">
                Become a Vendor
              </Button>
            )}
          </div>
        )}

        {/* CTA Section */}
        {!userVendor && (
          <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Join Our Vendor Network</h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Connect with couples planning their dream weddings. Grow your business with our trusted marketplace platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary"
                className="px-8 py-4 bg-white text-secondary hover:bg-gray-50"
                onClick={() => setIsCreateVendorDialogOpen(true)}
                data-testid="button-join-network"
              >
                Become a Vendor
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-4 border-white/30 text-white hover:bg-white/10"
                data-testid="button-learn-more-vendors"
              >
                Learn More
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
