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

export interface WeeklyTemplate {
  id: string;
  name: string;
  description: string;
  structureJson: TaskEvent[];
}