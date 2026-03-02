import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  category: z.string().min(1),
  start: z.string(),
  end: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  reminderMinutes: z.number().min(0).max(1440).optional()
});

export type TaskInput = z.infer<typeof taskSchema>;