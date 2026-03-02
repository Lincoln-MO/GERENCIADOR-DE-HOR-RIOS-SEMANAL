'use client';

import { useMemo, useState } from 'react';
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

export function TaskForm({ onAdd }: { onAdd: (tasks: TaskEvent[]) => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geral');
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [color, setColor] = useState('#2563eb');
  const [recurrencePattern, setRecurrencePattern] = useState<TaskEvent['recurrencePattern']>('weekly');

  const effectiveDays = useMemo(() => {
    if (recurrencePattern === 'once') {
      return selectedDays.length > 0 ? [selectedDays[0]] : [1];
    }
    return selectedDays.length > 0 ? selectedDays : [1];
  }, [recurrencePattern, selectedDays]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev;
        return prev.filter((value) => value !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

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
      className="card grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();

        const createdTasks = effectiveDays.map((dayOfWeek) => ({
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
        }));

        onAdd(createdTasks);
        setTitle('');
      }}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Título da tarefa" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Categoria" value={category} onChange={(e) => setCategory(e.target.value)} required />
        <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={recurrencePattern} onChange={(e) => setRecurrencePattern(e.target.value as TaskEvent['recurrencePattern'])}>
          <option value="once">Apenas uma vez</option>
          <option value="specific_days">Dias específicos</option>
          <option value="weekly">Toda semana</option>
        </select>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white" type="submit">Adicionar tarefa</button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input type="time" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        <input type="time" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        <input type="color" className="h-10 rounded-lg border border-slate-300 px-1 py-1 dark:border-slate-700 dark:bg-slate-950" value={color} onChange={(e) => setColor(e.target.value)} />
      </div>

      <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">Dias da semana</p>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setSelectedDays([1, 2, 3, 4, 5, 6])}>Seg–Sáb</button>
          <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => setSelectedDays([0, 1, 2, 3, 4, 5, 6])}>Semana toda</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {weekdays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`rounded-full border px-3 py-1 text-xs ${selectedDays.includes(day.value) ? 'border-brand bg-brand/10 text-brand' : 'border-slate-300'}`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}