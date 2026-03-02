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

export function updateEventTime(tasks: TaskEvent[], updated: { id: string; start: string; end: string }) {
  return tasks.map((task) => (task.id === updated.id ? { ...task, start: updated.start, end: updated.end } : task));
}