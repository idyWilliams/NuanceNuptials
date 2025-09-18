import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Heart, 
  Calendar, 
  Clock, 
  MapPin, 
  Mail,
  Check,
  X
} from "lucide-react";

const rsvpSchema = z.object({
  guestName: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  dietaryRestrictions: z.string().optional(),
  plusOneName: z.string().optional(),
  specialRequests: z.string().optional(),
});

type RsvpFormData = z.infer<typeof rsvpSchema>;

interface RsvpFormProps {
  eventId: string;
}

// Mock invitation data - in real app this would come from the database
const mockInvitation = {
  coupleName: "Sarah & Michael",
  eventDate: "2024-06-15T16:00:00Z",
  venue: "Rosewood Gardens",
  address: "123 Garden Lane, Napa Valley, CA",
  rsvpDeadline: "2024-05-01",
  message: "We would be honored to have you celebrate our special day with us.",
};

export default function RsvpForm({ eventId }: RsvpFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpSchema),
  });

  // RSVP submission mutation
  const rsvpMutation = useMutation({
    mutationFn: async (data: { status: string; guestData?: RsvpFormData }) => {
      // In a real app, this would find the guest by their unique link/ID
      // For now, we'll simulate updating RSVP status
      return await apiRequest("PATCH", `/api/guests/demo-guest-id/rsvp`, {
        status: data.status,
        ...data.guestData,
      });
    },
    onSuccess: () => {
      toast({
        title: "RSVP Submitted",
        description: "Thank you for your response!",
      });
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "guests"] });
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
        description: "Failed to submit RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRsvpResponse = (status: string) => {
    setSelectedStatus(status);
    if (status === 'declined') {
      rsvpMutation.mutate({ status });
    }
  };

  const handleFormSubmit = (data: RsvpFormData) => {
    if (selectedStatus === 'confirmed') {
      rsvpMutation.mutate({ status: selectedStatus, guestData: data });
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto" data-testid="rsvp-success">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-secondary mb-4">
            RSVP Submitted Successfully!
          </h2>
          <p className="text-muted-foreground">
            Thank you for your response. We've received your RSVP and will be in touch with more details as the date approaches.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="rsvp-form">
      {/* Digital Invitation */}
      <Card className="shadow-sm">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
              <Heart className="text-primary text-2xl" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-3xl text-secondary" data-testid="text-couple-name">
                {mockInvitation.coupleName}
              </h2>
              <p className="text-muted-foreground">request the pleasure of your company</p>
            </div>
            
            <div className="space-y-3 py-6 border-y border-border">
              <div className="flex items-center justify-center space-x-2 text-secondary">
                <Calendar className="w-4 h-4" />
                <span className="font-semibold" data-testid="text-event-date">
                  {new Date(mockInvitation.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-secondary">
                <Clock className="w-4 h-4" />
                <span data-testid="text-event-time">
                  {new Date(mockInvitation.eventDate).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-secondary">
                <MapPin className="w-4 h-4" />
                <span data-testid="text-venue">{mockInvitation.venue}</span>
              </div>
              {mockInvitation.address && (
                <p className="text-sm text-muted-foreground" data-testid="text-address">
                  {mockInvitation.address}
                </p>
              )}
            </div>
            
            {mockInvitation.message && (
              <p className="text-muted-foreground italic">{mockInvitation.message}</p>
            )}
            
            <p className="text-xs text-muted-foreground" data-testid="text-rsvp-deadline">
              RSVP by {new Date(mockInvitation.rsvpDeadline).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* RSVP Response */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Will you be attending?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 justify-center mb-6">
            <Button
              variant={selectedStatus === 'confirmed' ? 'default' : 'outline'}
              className="flex-1 max-w-48"
              onClick={() => handleRsvpResponse('confirmed')}
              disabled={rsvpMutation.isPending}
              data-testid="button-rsvp-accept"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              variant={selectedStatus === 'declined' ? 'destructive' : 'outline'}
              className="flex-1 max-w-48"
              onClick={() => handleRsvpResponse('declined')}
              disabled={rsvpMutation.isPending}
              data-testid="button-rsvp-decline"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>

          {selectedStatus === 'confirmed' && (
            <>
              <Separator className="mb-6" />
              <div>
                <h3 className="font-semibold text-secondary mb-4">Please provide your details</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="guestName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} data-testid="input-guest-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="john@example.com" 
                                {...field}
                                data-testid="input-guest-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="plusOneName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plus One Name (if applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} data-testid="input-plus-one" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dietaryRestrictions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dietary Restrictions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please let us know about any dietary restrictions or allergies..."
                              {...field}
                              data-testid="textarea-dietary-restrictions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialRequests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requests</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requests or accommodations needed..."
                              {...field}
                              data-testid="textarea-special-requests"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={rsvpMutation.isPending}
                      data-testid="button-submit-rsvp"
                    >
                      {rsvpMutation.isPending ? "Submitting..." : "Submit RSVP"}
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          )}

          {selectedStatus === 'declined' && (
            <div className="text-center py-4" data-testid="rsvp-declined-message">
              <p className="text-muted-foreground">
                We're sorry you can't make it. Thank you for letting us know.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
