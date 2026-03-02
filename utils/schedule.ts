import { TaskEvent } from '@/types/schedule';

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