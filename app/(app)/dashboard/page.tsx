import { AnalyticsCards } from '@/mvc/views/dashboard/analytics-cards.view';
import { TaskEvent } from '@/mvc/models/task.model';

const demoTasks: TaskEvent[] = [
  { id: '1', scheduleId: 'default', title: 'Estudo', category: 'Concurso', color: '#4f46e5', start: '2026-01-05T08:00:00', end: '2026-01-05T11:00:00', dayOfWeek: 1, isRecurring: true, recurrencePattern: 'weekly' },
  { id: '2', scheduleId: 'default', title: 'Treino', category: 'Saúde', color: '#059669', start: '2026-01-06T18:00:00', end: '2026-01-06T19:00:00', dayOfWeek: 2, isRecurring: true, recurrencePattern: 'weekly' }
];

export default function DashboardPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Dashboard Inteligente</h1>
      <AnalyticsCards tasks={demoTasks} />
      <section className="card">
        <h2 className="font-semibold">Comparação de semanas</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Histórico e evolução de produtividade (estrutura pronta para Realtime + charts).</p>
      </section>
    </main>
  );
}