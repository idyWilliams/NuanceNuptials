import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import ProductCard from "@/components/product-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Plus, Gift, ShoppingCart, Heart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const registryItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  targetAmount: z.number().min(0.01, "Target amount must be greater than 0"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

type RegistryItemFormData = z.infer<typeof registryItemSchema>;

export default function Registry() {
  const { eventId } = useParams<{ eventId?: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  const form = useForm<RegistryItemFormData>({
    resolver: zodResolver(registryItemSchema),
    defaultValues: {
      priority: "medium",
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

  // Fetch user events to select from
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory, searchTerm],
    enabled: isAuthenticated,
  });

  // Fetch registry items for selected event
  const { data: registryItems, isLoading: registryLoading } = useQuery({
    queryKey: ["/api/events", eventId, "registry"],
    enabled: isAuthenticated && !!eventId,
  });

  // Add item to registry mutation
  const addItemMutation = useMutation({
    mutationFn: async (data: RegistryItemFormData & { eventId: string }) => {
      return await apiRequest("POST", "/api/registry-items", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item added to registry!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "registry"] });
      setIsAddItemDialogOpen(false);
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
        description: "Failed to add item to registry",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = (data: RegistryItemFormData) => {
    if (!eventId) {
      toast({
        title: "Error",
        description: "Please select an event first",
        variant: "destructive",
      });
      return;
    }
    addItemMutation.mutate({ ...data, eventId });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="registry-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-secondary mb-2" data-testid="text-registry-title">
              Gift Registry
            </h1>
            <p className="text-muted-foreground">
              Create and manage your wedding gift registry
            </p>
          </div>
          
          {eventId && (
            <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0" data-testid="button-add-registry-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Item to Registry</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="productId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-product">
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.map((product: any) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-target-amount"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={addItemMutation.isPending}
                      data-testid="button-submit-registry-item"
                    >
                      {addItemMutation.isPending ? "Adding..." : "Add to Registry"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Event Selection */}
        {!eventId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select an Event</CardTitle>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event: any) => (
                    <Card 
                      key={event.id} 
                      className="cursor-pointer card-hover"
                      onClick={() => window.location.href = `/registry/${event.id}`}
                      data-testid={`card-event-${event.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Heart className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-secondary">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.eventDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="empty-events">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-secondary mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-4">Create an event first to start building your registry</p>
                  <Button onClick={() => window.location.href = "/"} data-testid="button-create-event">
                    Create Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {eventId && (
          <>
            {/* Registry Items */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Registry</CardTitle>
              </CardHeader>
              <CardContent>
                {registryLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : registryItems && registryItems.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {registryItems.map((item: any) => (
                      <ProductCard
                        key={item.id}
                        product={{
                          id: item.product.id,
                          name: item.product.name,
                          description: item.product.description,
                          price: parseFloat(item.targetAmount),
                          imageUrl: item.product.imageUrl || "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
                          currentAmount: parseFloat(item.currentAmount),
                          targetAmount: parseFloat(item.targetAmount),
                          contributorCount: 0, // TODO: Get actual contributor count
                          isCompleted: parseFloat(item.currentAmount) >= parseFloat(item.targetAmount),
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-registry">
                    <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-secondary mb-2">No registry items yet</h3>
                    <p className="text-muted-foreground mb-4">Add your first item to get started</p>
                    <Button 
                      onClick={() => setIsAddItemDialogOpen(true)}
                      data-testid="button-add-first-item"
                    >
                      Add Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Browse Products */}
            <Card>
              <CardHeader>
                <CardTitle>Browse Products</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-products"
                    />
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-category">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Products Grid */}
                {productsLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : products && products.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product: any) => (
                      <Card key={product.id} className="card-hover" data-testid={`card-browse-product-${product.id}`}>
                        <img 
                          src={product.imageUrl || "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop"} 
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-secondary mb-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                          <p className="text-lg font-bold text-primary mb-3">${product.price}</p>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              form.setValue("productId", product.id);
                              form.setValue("targetAmount", parseFloat(product.price));
                              setIsAddItemDialogOpen(true);
                            }}
                            data-testid={`button-add-product-${product.id}`}
                          >
                            Add to Registry
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="no-products">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-secondary mb-2">No products found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
