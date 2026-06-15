import { z } from 'zod';

export const tripInputSchema = z.object({
  origin: z.string().trim().min(1, '请填写出发地'),
  destination: z.string().trim().min(1, '请填写目的地'),
  startDate: z.string().trim().min(1, '请选择开始日期'),
  endDate: z.string().trim().min(1, '请选择结束日期'),
  budget: z.coerce.number().min(500, '预算至少 500 元'),
  preferences: z.array(z.string()).min(1, '至少选择一个旅行偏好'),
  pace: z.enum(['relaxed', 'standard', 'intensive']),
  specialRequests: z.string().optional()
}).superRefine((value, ctx) => {
  const start = new Date(`${value.startDate}T00:00:00`);
  const end = new Date(`${value.endDate}T00:00:00`);
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  if (!Number.isFinite(days) || days < 3 || days > 7) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endDate'],
      message: '第一版只支持 3 到 7 天单目的地行程'
    });
  }
});

export const generatedTripSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  totalBudget: z.coerce.number().nonnegative(),
  days: z.array(z.object({
    dayIndex: z.coerce.number().int().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    dayBudget: z.coerce.number().nonnegative(),
    items: z.array(z.object({
      startTime: z.string().min(1),
      endTime: z.string().min(1),
      placeName: z.string().min(1),
      category: z.string().min(1),
      notes: z.string().min(1),
      estimatedCost: z.coerce.number().nonnegative()
    })).min(3)
  })).min(3).max(7),
  tips: z.array(z.string()).min(1)
});

export function tripDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}
