export type Pace = 'relaxed' | 'standard' | 'intensive';
export type PlanStatus = 'draft' | 'generating' | 'success' | 'failed' | 'exported';
export type RunStatus = 'success' | 'failed';

export interface TripInput {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  preferences: string[];
  pace: Pace;
  specialRequests?: string;
}

export interface ItineraryItem {
  id?: string;
  startTime: string;
  endTime: string;
  placeName: string;
  category: string;
  notes: string;
  estimatedCost: number;
}

export interface ItineraryDay {
  id?: string;
  dayIndex: number;
  title: string;
  summary: string;
  dayBudget: number;
  items: ItineraryItem[];
}

export interface GeneratedTrip {
  title: string;
  summary: string;
  totalBudget: number;
  days: ItineraryDay[];
  tips: string[];
}

export interface TripPlan extends TripInput, GeneratedTrip {
  id: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerRun {
  id: string;
  tripPlanId?: string | null;
  provider: string;
  latencyMs: number;
  status: RunStatus;
  errorMessage?: string | null;
  destination?: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  successRate: number;
  averageLatencyMs: number;
  popularDestinations: Array<{ destination: string; count: number }>;
  recentRuns: PlannerRun[];
}
