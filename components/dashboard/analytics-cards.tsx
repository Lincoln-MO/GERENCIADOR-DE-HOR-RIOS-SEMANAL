import { TaskEvent } from '@/mvc/models/task.model';
import { totalHours } from '@/mvc/models/task.model';

export function AnalyticsCards({ tasks }: { tasks: TaskEvent[] }) {
  const hours = totalHours(tasks);
  const goal = 40;
  const progress = Math.min((hours / goal) * 100, 100);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="card"><p>Total semanal</p><p className="text-2xl font-bold">{hours.toFixed(1)}h</p></div>
      <div className="card"><p>Meta semanal</p><p className="text-2xl font-bold">{goal}h</p></div>
      <div className="card"><p>Produtividade</p><p className="text-2xl font-bold">{progress.toFixed(0)}%</p></div>
    </div>
  );
}