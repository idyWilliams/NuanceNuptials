import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Plus, Clock, CheckCircle, Calendar } from "lucide-react";

const timelineItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute").default(60),
  category: z.string().optional(),
});

type TimelineItemFormData = z.infer<typeof timelineItemSchema>;

interface EventTimelineProps {
  eventId: string;
  timeline?: any[];
}

export default function EventTimeline({ eventId, timeline }: EventTimelineProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  const form = useForm<TimelineItemFormData>({
    resolver: zodResolver(timelineItemSchema),
    defaultValues: {
      duration: 60,
    },
  });

  // Add timeline item mutation
  const addTimelineItemMutation = useMutation({
    mutationFn: async (data: TimelineItemFormData) => {
      return await apiRequest("POST", `/api/events/${eventId}/timeline`, {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timeline item added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "timeline"] });
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
        description: "Failed to add timeline item",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = (data: TimelineItemFormData) => {
    addTimelineItemMutation.mutate(data);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'ceremony': return 'bg-primary text-primary-foreground';
      case 'reception': return 'bg-secondary text-secondary-foreground';
      case 'photography': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card data-testid="event-timeline-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Wedding Day Timeline</CardTitle>
        <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-timeline-item">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timeline Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddItem)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Hair & Makeup" {...field} data-testid="input-timeline-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Bridal suite preparation begins..."
                          {...field}
                          data-testid="textarea-timeline-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            data-testid="input-timeline-start-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-timeline-duration"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ceremony, Reception, Photography..."
                          {...field}
                          data-testid="input-timeline-category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={addTimelineItemMutation.isPending}
                  data-testid="button-submit-timeline-item"
                >
                  {addTimelineItemMutation.isPending ? "Adding..." : "Add Timeline Item"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {timeline && timeline.length > 0 ? (
          <div className="space-y-4">
            {timeline.map((item: any) => (
              <div 
                key={item.id} 
                className="flex items-start space-x-4 pb-4 border-b border-border last:border-b-0"
                data-testid={`timeline-item-${item.id}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getCategoryColor(item.category)}`}>
                  {formatTime(item.startTime)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-secondary">{item.title}</h4>
                    <div className="flex items-center space-x-2">
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      {item.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{item.duration} minutes</span>
                    <span>•</span>
                    <span>
                      {formatTime(item.startTime)} - {
                        formatTime(new Date(new Date(item.startTime).getTime() + item.duration * 60000).toISOString())
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8" data-testid="empty-timeline">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-secondary mb-2">No timeline items yet</h3>
            <p className="text-muted-foreground mb-4">Create your wedding day schedule</p>
            <Button 
              onClick={() => setIsAddItemDialogOpen(true)}
              data-testid="button-add-first-timeline-item"
            >
              Add First Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
