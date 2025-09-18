export const VENDOR_CATEGORIES = [
  { value: "photographer", label: "Photographer" },
  { value: "venue", label: "Venue" },
  { value: "caterer", label: "Caterer" },
  { value: "planner", label: "Wedding Planner" },
  { value: "dj", label: "DJ & Music" },
  { value: "florist", label: "Florist" },
  { value: "baker", label: "Baker" },
  { value: "musician", label: "Musician" },
  { value: "videographer", label: "Videographer" },
  { value: "decorator", label: "Decorator" },
];

export const RSVP_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DECLINED: "declined",
} as const;

export const EVENT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const BOOKING_STATUS = {
  INQUIRY: "inquiry",
  QUOTED: "quoted",
  BOOKED: "booked",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PRIORITY_LEVELS = [
  { value: "high", label: "High Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "low", label: "Low Priority" },
];
