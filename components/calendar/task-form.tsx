'use client';

import { useState } from 'react';
import { TaskEvent } from '@/mvc/models/task.model';

const weekdays = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 }
];

export function TaskForm({ onAdd }: { onAdd: (task: TaskEvent) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geral');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [color, setColor] = useState('#2563eb');
  const [recurrencePattern, setRecurrencePattern] = useState<TaskEvent['recurrencePattern']>('weekly');

  const buildIsoDate = (time: string, targetDay: number) => {
    const now = new Date();
    const diff = targetDay - now.getDay();
    const target = new Date(now);
    target.setDate(now.getDate() + diff);

    const [hours, minutes] = time.split(':').map(Number);
    target.setHours(hours, minutes, 0, 0);

    return target.toISOString();
  };

  return (
    <form
      className="card grid gap-3 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd({
          id: crypto.randomUUID(),
          scheduleId: 'default',
          title,
          category,
          color,
          start: buildIsoDate(startTime, dayOfWeek),
          end: buildIsoDate(endTime, dayOfWeek),
          dayOfWeek,
          isRecurring: recurrencePattern !== 'once',
          recurrencePattern
        });
        setTitle('');
      }}
    >
      <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Título da tarefa" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
        {weekdays.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
      </select>
      <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value as TaskEvent['recurrencePattern'])}>
        <option value="once">Apenas uma vez</option>
        <option value="specific_days">Dias específicos</option>
        <option value="weekly">Toda semana</option>
      </select>
      <input type="time" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
      <input type="time" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
      <input type="color" className="h-10 rounded-lg border border-slate-300 px-1 py-1 dark:border-slate-700 dark:bg-slate-950" value={color} onChange={(e) => setColor(e.target.value)} />
      <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white" type="submit">Adicionar tarefa</button>
    </form>
  );
}