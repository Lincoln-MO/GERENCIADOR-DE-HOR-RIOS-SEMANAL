import { TaskEvent, hasConflict } from '@/mvc/models/task.model';

export function addTaskWithConflictCheck(tasks: TaskEvent[], task: TaskEvent, allowOverlap: boolean) {
  if (!allowOverlap && hasConflict(task, tasks)) {
    return tasks;
  }

  return [...tasks, task];
}

export function duplicateWeek(tasks: TaskEvent[]) {
  return tasks.map((task) => ({
    ...task,
    id: crypto.randomUUID(),
    start: new Date(new Date(task.start).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(new Date(task.end).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }));
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

export function duplicateWeekByDateRange(tasks: TaskEvent[], sourceWeekDate: string, rangeStartDate: string, rangeEndDate: string) {
  const sourceWeekStart = startOfWeek(new Date(sourceWeekDate));
  const sourceWeekEnd = new Date(sourceWeekStart);
  sourceWeekEnd.setDate(sourceWeekEnd.getDate() + 7);

  const rangeStartWeek = startOfWeek(new Date(rangeStartDate));
  const rangeEndWeek = startOfWeek(new Date(rangeEndDate));

  if (Number.isNaN(sourceWeekStart.getTime()) || Number.isNaN(rangeStartWeek.getTime()) || Number.isNaN(rangeEndWeek.getTime())) {
    return [];
  }

  const sourceWeekTasks = tasks.filter((task) => {
    const start = new Date(task.start);
    return start >= sourceWeekStart && start < sourceWeekEnd;
  });

  const duplicatedTasks: TaskEvent[] = [];
  for (let cursor = new Date(rangeStartWeek); cursor <= rangeEndWeek; cursor.setDate(cursor.getDate() + 7)) {
    const offsetWeeks = Math.round((cursor.getTime() - sourceWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (offsetWeeks === 0) continue;

    sourceWeekTasks.forEach((task) => {
      const start = new Date(task.start);
      const end = new Date(task.end);
      start.setDate(start.getDate() + offsetWeeks * 7);
      end.setDate(end.getDate() + offsetWeeks * 7);

      duplicatedTasks.push({
        ...task,
        id: crypto.randomUUID(),
        start: start.toISOString(),
        end: end.toISOString(),
        dayOfWeek: start.getDay()
      });
    });
  }

  return duplicatedTasks;
}

export function updateEventTime(tasks: TaskEvent[], updated: { id: string; start: string; end: string }) {
  return tasks.map((task) => (task.id === updated.id ? { ...task, start: updated.start, end: updated.end } : task));
}