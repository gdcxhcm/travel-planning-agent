import { AdminStats, GeneratedTrip, PlannerRun, TripInput, TripPlan } from './types';
import { createClient } from '@supabase/supabase-js';

type MemoryState = {
  plans: TripPlan[];
  runs: PlannerRun[];
};

const globalForStore = globalThis as typeof globalThis & { __travelAgentStore?: MemoryState };
const memoryStore = globalForStore.__travelAgentStore || { plans: [], runs: [] };
globalForStore.__travelAgentStore = memoryStore;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' })
    }
  });
}

export async function saveTrip(input: TripInput, generated: GeneratedTrip): Promise<TripPlan> {
  const supabase = getSupabase();
  if (!supabase) return saveTripInMemory(input, generated);

  const { data: plan, error: planError } = await supabase
    .from('trip_plans')
    .insert({
      origin: input.origin,
      destination: input.destination,
      start_date: input.startDate,
      end_date: input.endDate,
      budget: input.budget,
      preferences: input.preferences,
      pace: input.pace,
      special_requests: input.specialRequests || null,
      title: generated.title,
      summary: generated.summary,
      total_budget: generated.totalBudget,
      tips: generated.tips,
      status: 'success'
    })
    .select('*')
    .single();

  if (planError) throw planError;

  for (const day of generated.days) {
    const { data: savedDay, error: dayError } = await supabase
      .from('itinerary_days')
      .insert({
        trip_plan_id: plan.id,
        day_index: day.dayIndex,
        title: day.title,
        summary: day.summary,
        day_budget: day.dayBudget
      })
      .select('*')
      .single();
    if (dayError) throw dayError;

    const { error: itemError } = await supabase.from('itinerary_items').insert(
      day.items.map((item) => ({
        itinerary_day_id: savedDay.id,
        start_time: item.startTime,
        end_time: item.endTime,
        place_name: item.placeName,
        category: item.category,
        notes: item.notes,
        estimated_cost: item.estimatedCost
      }))
    );
    if (itemError) throw itemError;
  }

  return getTrip(plan.id) as Promise<TripPlan>;
}

export async function getTrip(id: string): Promise<TripPlan | null> {
  const supabase = getSupabase();
  if (!supabase) return memoryStore.plans.find((plan) => plan.id === id) || null;

  const { data: plan, error } = await supabase
    .from('trip_plans')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;

  const { data: days, error: daysError } = await supabase
    .from('itinerary_days')
    .select('*, itinerary_items(*)')
    .eq('trip_plan_id', id)
    .order('day_index', { ascending: true });
  if (daysError) throw daysError;

  return mapPlan(plan, days || []);
}

export async function listTrips(): Promise<TripPlan[]> {
  const supabase = getSupabase();
  if (!supabase) return [...memoryStore.plans].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const { data, error } = await supabase
    .from('trip_plans')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((plan) => ({
    id: plan.id,
    origin: plan.origin,
    destination: plan.destination,
    startDate: plan.start_date,
    endDate: plan.end_date,
    budget: Number(plan.budget),
    preferences: plan.preferences || [],
    pace: plan.pace,
    specialRequests: plan.special_requests || '',
    title: plan.title,
    summary: plan.summary,
    totalBudget: Number(plan.total_budget),
    days: [],
    tips: plan.tips || [],
    status: plan.status,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at
  }));
}

export async function recordRun(run: Omit<PlannerRun, 'id' | 'createdAt'>): Promise<PlannerRun> {
  const supabase = getSupabase();
  if (!supabase) {
    const saved: PlannerRun = {
      ...run,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    memoryStore.runs.unshift(saved);
    return saved;
  }

  const { data, error } = await supabase
    .from('planner_runs')
    .insert({
      trip_plan_id: run.tripPlanId || null,
      provider: run.provider,
      latency_ms: run.latencyMs,
      status: run.status,
      error_message: run.errorMessage || null,
      destination: run.destination || null
    })
    .select('*')
    .single();
  if (error) throw error;

  return {
    id: data.id,
    tripPlanId: data.trip_plan_id,
    provider: data.provider,
    latencyMs: data.latency_ms,
    status: data.status,
    errorMessage: data.error_message,
    destination: data.destination,
    createdAt: data.created_at
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = getSupabase();
  const runs = supabase ? await getRunsFromSupabase(supabase) : memoryStore.runs;
  const totalRuns = runs.length;
  const successRuns = runs.filter((run) => run.status === 'success').length;
  const failedRuns = totalRuns - successRuns;
  const averageLatencyMs = totalRuns
    ? Math.round(runs.reduce((sum, run) => sum + run.latencyMs, 0) / totalRuns)
    : 0;

  const destinationCounts = new Map<string, number>();
  runs.forEach((run) => {
    if (!run.destination) return;
    destinationCounts.set(run.destination, (destinationCounts.get(run.destination) || 0) + 1);
  });

  return {
    totalRuns,
    successRuns,
    failedRuns,
    successRate: totalRuns ? Math.round((successRuns / totalRuns) * 100) : 0,
    averageLatencyMs,
    popularDestinations: Array.from(destinationCounts.entries())
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    recentRuns: runs.slice(0, 12)
  };
}

async function getRunsFromSupabase(supabase: NonNullable<ReturnType<typeof getSupabase>>): Promise<PlannerRun[]> {
  const { data, error } = await supabase
    .from('planner_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data || []).map((run) => ({
    id: run.id,
    tripPlanId: run.trip_plan_id,
    provider: run.provider,
    latencyMs: run.latency_ms,
    status: run.status,
    errorMessage: run.error_message,
    destination: run.destination,
    createdAt: run.created_at
  }));
}

function saveTripInMemory(input: TripInput, generated: GeneratedTrip): TripPlan {
  const now = new Date().toISOString();
  const plan: TripPlan = {
    ...input,
    ...generated,
    id: crypto.randomUUID(),
    status: 'success',
    createdAt: now,
    updatedAt: now
  };
  memoryStore.plans.unshift(plan);
  return plan;
}

function mapPlan(plan: any, days: any[]): TripPlan {
  return {
    id: plan.id,
    origin: plan.origin,
    destination: plan.destination,
    startDate: plan.start_date,
    endDate: plan.end_date,
    budget: Number(plan.budget),
    preferences: plan.preferences || [],
    pace: plan.pace,
    specialRequests: plan.special_requests || '',
    title: plan.title,
    summary: plan.summary,
    totalBudget: Number(plan.total_budget),
    days: days.map((day) => ({
      id: day.id,
      dayIndex: day.day_index,
      title: day.title,
      summary: day.summary,
      dayBudget: Number(day.day_budget),
      items: (day.itinerary_items || []).map((item: any) => ({
        id: item.id,
        startTime: item.start_time,
        endTime: item.end_time,
        placeName: item.place_name,
        category: item.category,
        notes: item.notes,
        estimatedCost: Number(item.estimated_cost)
      }))
    })),
    tips: plan.tips || [],
    status: plan.status,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at
  };
}
