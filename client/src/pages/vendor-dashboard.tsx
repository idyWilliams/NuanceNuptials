import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Star, 
  Calendar, 
  DollarSign, 
  Users, 
  Camera, 
  Plus,
  MessageSquare,
  TrendingUp,
  Eye,
  Edit
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { BOOKING_STATUS } from "@/lib/constants";

export default function VendorDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [caption, setCaption] = useState("");

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

  // Fetch vendor profile
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["/api/my-vendor"],
    enabled: isAuthenticated,
  });

  // Fetch vendor bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/my-bookings"],
    enabled: isAuthenticated,
  });

  // Fetch portfolio
  const { data: portfolio } = useQuery({
    queryKey: ["/api/vendors", vendor?.id, "portfolio"],
    enabled: isAuthenticated && !!vendor?.id,
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ["/api/vendors", vendor?.id, "reviews"],
    enabled: isAuthenticated && !!vendor?.id,
  });

  // Upload portfolio image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption: string }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      
      const response = await fetch(`/api/vendors/${vendor.id}/portfolio`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image uploaded to portfolio!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors", vendor?.id, "portfolio"] });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setCaption("");
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
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status, price }: { bookingId: string; status: string; price?: number }) => {
      return await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status, price });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-bookings"] });
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
        description: "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadImageMutation.mutate({ file: selectedFile, caption });
    }
  };

  const handleBookingUpdate = (bookingId: string, status: string, price?: number) => {
    updateBookingMutation.mutate({ bookingId, status, price });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="vendor-dashboard-loading">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background" data-testid="no-vendor-profile">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary mb-2">No Vendor Profile</h2>
            <p className="text-muted-foreground mb-6">
              You need to create a vendor profile to access the dashboard.
            </p>
            <Button onClick={() => window.location.href = "/vendors"} data-testid="button-create-profile">
              Create Vendor Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="vendor-dashboard-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-secondary mb-2" data-testid="text-dashboard-title">
              Vendor Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your business and connect with couples
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {vendor.isVerified && (
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                Verified
              </Badge>
            )}
            {vendor.isFeatured && (
              <Badge variant="secondary" className="vendor-badge text-white">
                Featured
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-bookings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-secondary">{bookings?.length || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-rating">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold text-secondary">{vendor.rating || "0.0"}</p>
                </div>
                <Star className="h-8 w-8 text-primary fill-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="text-2xl font-bold text-secondary">{vendor.reviewCount || 0}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-earnings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Starting Price</p>
                  <p className="text-2xl font-bold text-secondary">${vendor.startingPrice || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="portfolio" data-testid="tab-portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`booking-item-${booking.id}`}>
                        <div className="flex-1">
                          <h3 className="font-semibold text-secondary">
                            Service Date: {new Date(booking.serviceDate).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Status: <Badge variant="outline">{booking.status}</Badge>
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Notes: {booking.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {booking.status === BOOKING_STATUS.INQUIRY && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleBookingUpdate(booking.id, BOOKING_STATUS.QUOTED, 0)}
                                data-testid={`button-quote-${booking.id}`}
                              >
                                Send Quote
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleBookingUpdate(booking.id, BOOKING_STATUS.CONFIRMED)}
                                data-testid={`button-accept-${booking.id}`}
                              >
                                Accept
                              </Button>
                            </>
                          )}
                          
                          {booking.status === BOOKING_STATUS.QUOTED && (
                            <Button 
                              size="sm"
                              onClick={() => handleBookingUpdate(booking.id, BOOKING_STATUS.CONFIRMED)}
                              data-testid={`button-confirm-${booking.id}`}
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-bookings">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-secondary mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground">Your booking requests will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Portfolio</CardTitle>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-portfolio-image">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Portfolio Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="image">Select Image</Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          data-testid="input-portfolio-image"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="caption">Caption (Optional)</Label>
                        <Input
                          id="caption"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Describe this image..."
                          data-testid="input-image-caption"
                        />
                      </div>
                      
                      <Button 
                        onClick={handleUpload}
                        disabled={!selectedFile || uploadImageMutation.isPending}
                        className="w-full"
                        data-testid="button-upload-image"
                      >
                        {uploadImageMutation.isPending ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {portfolio && portfolio.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {portfolio.map((image: any) => (
                      <div key={image.id} className="group relative" data-testid={`portfolio-image-${image.id}`}>
                        <img
                          src={image.imageUrl}
                          alt={image.caption || "Portfolio image"}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                            <p className="text-sm">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-portfolio">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-secondary mb-2">No portfolio images</h3>
                    <p className="text-muted-foreground mb-4">Showcase your work by adding images</p>
                    <Button onClick={() => setIsUploadDialogOpen(true)} data-testid="button-add-first-image">
                      Add First Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-border pb-4" data-testid={`review-item-${review.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-secondary mb-1">{review.title}</h4>
                        )}
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-reviews">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-secondary mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">Customer reviews will appear here after completed bookings</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name</Label>
                    <p className="text-secondary font-medium">{vendor.businessName}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-secondary font-medium">{vendor.category}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="text-secondary font-medium">{vendor.location}</p>
                  </div>
                  <div>
                    <Label>Starting Price</Label>
                    <p className="text-secondary font-medium">${vendor.startingPrice}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <p className="text-secondary">{vendor.description}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {vendor.website && (
                    <div>
                      <Label>Website</Label>
                      <p className="text-secondary">
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {vendor.website}
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <Label>Phone</Label>
                    <p className="text-secondary font-medium">{vendor.phone}</p>
                  </div>
                </div>
                
                <Button variant="outline" data-testid="button-edit-profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
