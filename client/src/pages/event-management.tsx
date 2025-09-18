import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import EventTimeline from "@/components/event-timeline";
import RsvpForm from "@/components/rsvp-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Gift, 
  Clock,
  Mail,
  Plus,
  Share,
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { RSVP_STATUS } from "@/lib/constants";

const guestSchema = z.object({
  email: z.string().email("Valid email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  plusOneAllowed: z.boolean().default(false),
});

type GuestFormData = z.infer<typeof guestSchema>;

export default function EventManagement() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      plusOneAllowed: false,
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

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["/api/events", eventId],
    enabled: isAuthenticated && !!eventId,
  });

  // Fetch event guests
  const { data: guests, isLoading: guestsLoading } = useQuery({
    queryKey: ["/api/events", eventId, "guests"],
    enabled: isAuthenticated && !!eventId,
  });

  // Fetch event timeline
  const { data: timeline } = useQuery({
    queryKey: ["/api/events", eventId, "timeline"],
    enabled: isAuthenticated && !!eventId,
  });

  // Add guest mutation
  const addGuestMutation = useMutation({
    mutationFn: async (data: GuestFormData) => {
      return await apiRequest("POST", `/api/events/${eventId}/guests`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Guest added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "guests"] });
      setIsAddGuestDialogOpen(false);
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
        description: "Failed to add guest",
        variant: "destructive",
      });
    },
  });

  const handleAddGuest = (data: GuestFormData) => {
    addGuestMutation.mutate(data);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="event-loading">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background" data-testid="event-not-found">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-secondary mb-2">Event Not Found</h2>
            <p className="text-muted-foreground">The event you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  const rsvpStats = guests ? {
    confirmed: guests.filter((g: any) => g.rsvpStatus === RSVP_STATUS.CONFIRMED).length,
    declined: guests.filter((g: any) => g.rsvpStatus === RSVP_STATUS.DECLINED).length,
    pending: guests.filter((g: any) => g.rsvpStatus === RSVP_STATUS.PENDING).length,
  } : { confirmed: 0, declined: 0, pending: 0 };

  return (
    <div className="min-h-screen bg-background" data-testid="event-management-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-secondary mb-2" data-testid="text-event-title">
              {event.title}
            </h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(event.eventDate).toLocaleDateString()}</span>
              </div>
              {event.venue && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue}</span>
                </div>
              )}
              <Badge variant="outline">{event.status}</Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="outline" data-testid="button-share-event">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" data-testid="button-event-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-guests">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Guests</p>
                  <p className="text-2xl font-bold text-secondary">{guests?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-confirmed-rsvp">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-primary">{rsvpStats.confirmed}</p>
                </div>
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-rsvp">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-secondary">{rsvpStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-declined-rsvp">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Declined</p>
                  <p className="text-2xl font-bold text-muted-foreground">{rsvpStats.declined}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="guests" data-testid="tab-guests">Guest List</TabsTrigger>
            <TabsTrigger value="timeline" data-testid="tab-timeline">Timeline</TabsTrigger>
            <TabsTrigger value="rsvp" data-testid="tab-rsvp">RSVP</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-secondary">{event.description || "No description provided"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date</label>
                      <p className="text-secondary">{new Date(event.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Time</label>
                      <p className="text-secondary">{new Date(event.eventDate).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  
                  {event.venue && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Venue</label>
                      <p className="text-secondary">{event.venue}</p>
                    </div>
                  )}
                  
                  {event.address && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="text-secondary">{event.address}</p>
                    </div>
                  )}
                  
                  {event.maxGuests && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Max Guests</label>
                      <p className="text-secondary">{event.maxGuests}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RSVP Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>RSVP Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{rsvpStats.confirmed}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Confirmed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-muted-foreground">{rsvpStats.declined}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Declined</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary">{rsvpStats.pending}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
                      </div>
                    </div>
                    
                    {guests && guests.length > 0 && (
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(rsvpStats.confirmed / guests.length) * 100}%` 
                          }}
                        />
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground text-center">
                      {rsvpStats.confirmed} of {guests?.length || 0} guests confirmed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Guest List</CardTitle>
                <Dialog open={isAddGuestDialogOpen} onOpenChange={setIsAddGuestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-guest">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Guest
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Guest</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddGuest)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} data-testid="input-guest-first-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} data-testid="input-guest-last-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@example.com" {...field} data-testid="input-guest-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="plusOneAllowed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="mt-1"
                                  data-testid="checkbox-plus-one"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Allow Plus One</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={addGuestMutation.isPending}
                          data-testid="button-submit-guest"
                        >
                          {addGuestMutation.isPending ? "Adding..." : "Add Guest"}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {guestsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : guests && guests.length > 0 ? (
                  <div className="space-y-4">
                    {guests.map((guest: any) => (
                      <div key={guest.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`guest-item-${guest.id}`}>
                        <div>
                          <h3 className="font-semibold text-secondary">
                            {guest.firstName} {guest.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{guest.email}</p>
                          {guest.plusOneAllowed && (
                            <p className="text-xs text-primary">Plus one allowed</p>
                          )}
                        </div>
                        
                        <Badge 
                          variant={guest.rsvpStatus === RSVP_STATUS.CONFIRMED ? "default" : 
                                  guest.rsvpStatus === RSVP_STATUS.DECLINED ? "destructive" : "outline"}
                          data-testid={`badge-rsvp-${guest.id}`}
                        >
                          {guest.rsvpStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-guests">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-secondary mb-2">No guests added yet</h3>
                    <p className="text-muted-foreground mb-4">Start building your guest list</p>
                    <Button onClick={() => setIsAddGuestDialogOpen(true)} data-testid="button-add-first-guest">
                      Add First Guest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <EventTimeline eventId={eventId} timeline={timeline} />
          </TabsContent>

          <TabsContent value="rsvp" className="space-y-6">
            <RsvpForm eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
