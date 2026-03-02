'use client';

import { useMemo, useState } from 'react';
import { PlannerCalendar } from '@/mvc/views/calendar/planner-calendar.view';
import { TaskForm } from '@/mvc/views/calendar/task-form.view';
import { CalendarView, TaskEvent, hasConflict } from '@/mvc/models/task.model';

import { exportAsDocx, exportAsExcel, exportAsPdf, exportAsPng } from '@/mvc/controllers/export.controller';
import { addTaskWithConflictCheck, duplicateWeek, updateEventTime } from '@/mvc/controllers/planner.controller';

const initialTasks: TaskEvent[] = [
  {
    id: '1',
    scheduleId: 'default',
    title: 'Deep Work',
    category: 'Trabalho',
    color: '#2563eb',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    dayOfWeek: new Date().getDay(),
    isRecurring: true,
    recurrencePattern: 'weekly'
  }
];

export default function PlannerPage() {
  const [tasks, setTasks] = useState<TaskEvent[]>(initialTasks);
  const [view, setView] = useState<CalendarView>('timeGridWeek');
  const [compact, setCompact] = useState(false);

  const warnings = useMemo(() => tasks.filter((task) => hasConflict(task, tasks)).length, [tasks]);

  const handleAddTask = (task: TaskEvent) => {

    const allowOverlap = !hasConflict(task, tasks)
      ? true
      : window.confirm('Conflito detectado. Deseja permitir sobreposição desta tarefa?');

    if (!allowOverlap) return;
    setTasks((prev) => addTaskWithConflictCheck(prev, task, allowOverlap));
  };


  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border px-3 py-2" onClick={() => setView('timeGridWeek')}>Semana</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setView('timeGridDay')}>Dia</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setView('dayGridMonth')}>Mês</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setCompact((v) => !v)}>{compact ? 'Modo completo' : 'Modo resumido'}</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setTasks((prev) => [...prev, ...duplicateWeek(prev)])}>Duplicar semana</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => exportAsExcel(tasks)}>Excel</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => exportAsDocx(tasks)}>DOCX</button>
        <button className="rounded-lg border px-3 py-2" onClick={async () => {
          const el = document.getElementById('planner-grid');
          if (el) await exportAsPdf(el);
        }}>PDF</button>
        <button className="rounded-lg border px-3 py-2" onClick={async () => {
          const el = document.getElementById('planner-grid');
          if (el) await exportAsPng(el);
        }}>PNG</button>
      </div>
      {warnings > 0 && <p className="rounded-lg bg-amber-100 p-3 text-amber-700">Existem {warnings} conflito(s) de horário.</p>}
      <TaskForm onAdd={handleAddTask} />
      <PlannerCalendar
        events={tasks}
        view={view}
        compact={compact}
        slotMinTime="05:00:00"
        slotMaxTime="23:59:00"
        onEventChange={(updated) => setTasks((prev) => updateEventTime(prev, updated))}
      />
      <section className="card md:hidden">
        <h2 className="mb-2 font-semibold">Modo lista (mobile)</h2>
        <ul className="space-y-2 text-sm">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
              <p className="font-medium">{task.title}</p>
              <p className="text-slate-600 dark:text-slate-300">{new Date(task.start).toLocaleString('pt-BR')} - {new Date(task.end).toLocaleTimeString('pt-BR')}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}