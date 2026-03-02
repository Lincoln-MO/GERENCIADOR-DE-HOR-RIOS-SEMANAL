import { z } from 'zod';

export type CalendarView = 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth';

export interface TaskEvent {
  id: string;
  scheduleId: string;
  title: string;
  description?: string;
  category: string;
  color: string;
  start: string;
  end: string;
  dayOfWeek: number;
  isRecurring: boolean;
  recurrencePattern: 'once' | 'specific_days' | 'weekly';
  reminderMinutes?: number;
}

export const taskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  category: z.string().min(1),
  start: z.string(),
  end: z.string(),
  dayOfWeek: z.number().min(0).max(6),
  reminderMinutes: z.number().min(0).max(1440).optional()
});

export function hasConflict(candidate: TaskEvent, tasks: TaskEvent[]) {
  return tasks.some((task) =>
    task.dayOfWeek === candidate.dayOfWeek &&
    task.id !== candidate.id &&
    !(candidate.end <= task.start || candidate.start >= task.end)
  );
}

export function totalHours(tasks: TaskEvent[]) {
  return tasks.reduce((sum, task) => {
    const hours = (new Date(task.end).getTime() - new Date(task.start).getTime()) / 36e5;
    return sum + Math.max(hours, 0);
  }, 0);
}