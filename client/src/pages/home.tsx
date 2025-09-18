import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Calendar, 
  Gift, 
  Users, 
  TrendingUp, 
  Plus,
  Heart,
  Star
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    retry: false,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-secondary mb-2" data-testid="text-welcome">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'vendor' 
              ? "Manage your services and connect with couples planning their special day."
              : "Let's continue planning your perfect celebration."
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover cursor-pointer" data-testid="card-create-event">
            <Link href="/events/new">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Create Event</h3>
                <p className="text-sm text-muted-foreground">Start planning your special day</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="card-hover cursor-pointer" data-testid="card-browse-registry">
            <Link href="/registry">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Registry</h3>
                <p className="text-sm text-muted-foreground">Manage gift registries</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="card-hover cursor-pointer" data-testid="card-find-vendors">
            <Link href="/vendors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">Find Vendors</h3>
                <p className="text-sm text-muted-foreground">Discover amazing services</p>
              </CardContent>
            </Link>
          </Card>

          {user?.role === 'vendor' ? (
            <Card className="card-hover cursor-pointer" data-testid="card-vendor-dashboard">
              <Link href="/vendor-dashboard">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-secondary mb-2">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Manage your business</p>
                </CardContent>
              </Link>
            </Card>
          ) : (
            <Card className="card-hover cursor-pointer" data-testid="card-rsvp">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">RSVP</h3>
                <p className="text-sm text-muted-foreground">Respond to invitations</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Your Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-secondary">Your Events</CardTitle>
                <Button size="sm" asChild data-testid="button-create-event">
                  <Link href="/events/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors" data-testid={`event-item-${event.id}`}>
                        <div className="flex items-center space-x-4">
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
                        <Button variant="outline" size="sm" asChild data-testid={`button-view-event-${event.id}`}>
                          <Link href={`/events/${event.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-events">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-secondary mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first event to get started</p>
                    <Button asChild data-testid="button-create-first-event">
                      <Link href="/events/new">Create Event</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats & Tips */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-secondary">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-semibold text-secondary">{events?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Registry Items</span>
                  <span className="font-semibold text-secondary">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contributions</span>
                  <span className="font-semibold text-secondary">-</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-secondary">Tips & Inspiration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-accent/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-secondary">Pro Tip</h4>
                        <p className="text-sm text-muted-foreground">
                          Start your registry early to give guests plenty of time to contribute to group gifts.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Gift className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-secondary">Featured</h4>
                        <p className="text-sm text-muted-foreground">
                          Group gifting makes expensive items more accessible for your guests.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
