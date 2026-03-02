'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PlannerCalendar } from '@/mvc/views/calendar/planner-calendar.view';
import { TaskForm } from '@/mvc/views/calendar/task-form.view';
import { CalendarView, TaskEvent, hasConflict } from '@/mvc/models/task.model';

import { exportAsDocx, exportAsExcel, exportAsPdf, exportAsPng } from '@/mvc/controllers/export.controller';
import { addTaskWithConflictCheck, duplicateWeek, updateEventTime } from '@/mvc/controllers/planner.controller';

const STORAGE_KEY = 'timeplanner:tasks';
const EXPORT_VERSION = '1.0';
const EXPORT_MARKER_START = '<!-- TIMEPLANNER_EXPORT_START -->';
const EXPORT_MARKER_END = '<!-- TIMEPLANNER_EXPORT_END -->';

const initialTasks: TaskEvent[] = [
  {
    id: '1',
    scheduleId: 'default',
    title: 'Trabalho focado',
    category: 'Trabalho',
    color: '#2563eb',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    dayOfWeek: new Date().getDay(),
    isRecurring: true,
    recurrencePattern: 'weekly'
  }
];

const defaultCategories = ['Trabalho', 'Concurso', 'Saúde'];

interface ExportPayload {
  app: 'timeplanner-pro';
  version: string;
  exportedAt: string;
  tasks: TaskEvent[];
}

function isValidTask(candidate: unknown): candidate is TaskEvent {
  if (!candidate || typeof candidate !== 'object') return false;
  const task = candidate as TaskEvent;

  const validRecurrence = ['once', 'specific_days', 'weekly'].includes(task.recurrencePattern);

  return Boolean(
    typeof task.id === 'string' &&
    typeof task.scheduleId === 'string' &&
    typeof task.title === 'string' &&
    typeof task.category === 'string' &&
    typeof task.color === 'string' &&
    /^#[0-9a-fA-F]{6}$/.test(task.color) &&
    typeof task.start === 'string' &&
    typeof task.end === 'string' &&
    !Number.isNaN(new Date(task.start).getTime()) &&
    !Number.isNaN(new Date(task.end).getTime()) &&
    typeof task.dayOfWeek === 'number' &&
    task.dayOfWeek >= 0 && task.dayOfWeek <= 6 &&
    typeof task.isRecurring === 'boolean' &&
    validRecurrence
  );
}

function isValidPayload(payload: unknown): payload is ExportPayload {
  if (!payload || typeof payload !== 'object') return false;
  const parsed = payload as ExportPayload;

  return (
    parsed.app === 'timeplanner-pro' &&
    typeof parsed.version === 'string' &&
    typeof parsed.exportedAt === 'string' &&
    !Number.isNaN(new Date(parsed.exportedAt).getTime()) &&
    Array.isArray(parsed.tasks) &&
    parsed.tasks.every(isValidTask)
  );
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PlannerPage() {
  const [tasks, setTasks] = useState<TaskEvent[]>(initialTasks);
  const [view, setView] = useState<CalendarView>('timeGridWeek');
  const [compact, setCompact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [jumpToDate, setJumpToDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as TaskEvent[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTasks(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const warnings = useMemo(() => tasks.filter((task) => hasConflict(task, tasks)).length, [tasks]);

  const categoryOptions = useMemo(() => {
    const dynamicCategories = tasks.map((task) => task.category).filter(Boolean);
    return ['Todas', ...Array.from(new Set([...defaultCategories, ...dynamicCategories]))];
  }, [tasks]);

  const filteredTasks = useMemo(
    () => selectedCategory === 'Todas' ? tasks : tasks.filter((task) => task.category === selectedCategory),
    [tasks, selectedCategory]
  );

  const legendItems = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((task) => {
      if (!map.has(task.category)) {
        map.set(task.category, task.color);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [tasks]);

  const handleAddTask = (task: TaskEvent) => {
    const allowOverlap = !hasConflict(task, tasks)
      ? true
      : window.confirm('Conflito detectado. Deseja permitir sobreposição desta tarefa?');

    if (!allowOverlap) return;
    setTasks((prev) => addTaskWithConflictCheck(prev, task, allowOverlap));
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const clearAllTasks = () => {
    const confirmed = window.confirm('Tem certeza que deseja excluir todas as tarefas?');
    if (confirmed) {
      setTasks([]);
    }
  };

  const handleExportHtml = () => {
    const payload: ExportPayload = {
      app: 'timeplanner-pro',
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      tasks
    };

    const payloadBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

    const cards = tasks
      .map((task) => `
        <article class="task-card">
          <div class="task-dot" style="background:${task.color}"></div>
          <div>
            <h3>${task.title}</h3>
            <p><strong>Categoria:</strong> ${task.category}</p>
            <p><strong>Início:</strong> ${new Date(task.start).toLocaleString('pt-BR')}</p>
            <p><strong>Fim:</strong> ${new Date(task.end).toLocaleString('pt-BR')}</p>
          </div>
        </article>`)
      .join('');

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planejamento exportado</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
    .container { max-width: 900px; margin: 0 auto; padding: 24px; }
    .header { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    .task-card { display: flex; gap: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
    .task-card h3 { margin: 0 0 6px; font-size: 16px; }
    .task-card p { margin: 4px 0; font-size: 14px; }
    .task-dot { width: 10px; border-radius: 999px; }
    .note { margin-top: 18px; font-size: 13px; color: #475569; }
  </style>
</head>
<body>
  <main class="container">
    <section class="header">
      <h1>Planejamento semanal exportado</h1>
      <p>Gerado em: ${new Date(payload.exportedAt).toLocaleString('pt-BR')}</p>
      <p>Total de tarefas: ${tasks.length}</p>
    </section>
    <section class="grid">${cards || '<p>Nenhuma tarefa cadastrada.</p>'}</section>
    <p class="note">Este arquivo é somente visualização e não é editável diretamente.</p>
  </main>
  ${EXPORT_MARKER_START}${payloadBase64}${EXPORT_MARKER_END}
</body>
</html>`;

    downloadFile(`planejamento-${new Date().toISOString().slice(0, 10)}.html`, html, 'text/html;charset=utf-8');
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.html')) {
      window.alert('Arquivo inválido. Envie um arquivo HTML exportado pelo Planejador Semanal.');
      event.target.value = '';
      return;
    }

    const text = await file.text();
    const startIndex = text.indexOf(EXPORT_MARKER_START);
    const endIndex = text.indexOf(EXPORT_MARKER_END);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      window.alert('Arquivo não reconhecido. Use apenas arquivos exportados por este sistema.');
      event.target.value = '';
      return;
    }

    try {
      const base64 = text.slice(startIndex + EXPORT_MARKER_START.length, endIndex).trim();
      const json = decodeURIComponent(escape(atob(base64)));
      const payload = JSON.parse(json) as unknown;

      if (!isValidPayload(payload)) {
        throw new Error('payload inválido');
      }

      setTasks(payload.tasks);
      setSelectedCategory('Todas');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.tasks));
      window.alert(`Importação concluída com sucesso! ${payload.tasks.length} tarefa(s) carregada(s).`);
    } catch {
      window.alert('Falha ao importar. O arquivo parece corrompido, modificado manualmente ou incompatível.');
    }

    event.target.value = '';
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap gap-2">
        <button className="rounded-lg border px-3 py-2" onClick={() => setView('timeGridWeek')}>Semana</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setView('dayGridMonth')}>Mês</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setCompact((v) => !v)}>{compact ? 'Modo detalhado' : 'Modo compacto'}</button>
        <button className="rounded-lg border px-3 py-2" onClick={() => setTasks((prev) => [...prev, ...duplicateWeek(prev)])}>Duplicar semana</button>
        <button className="rounded-lg border border-red-300 px-3 py-2 text-red-600" onClick={clearAllTasks}>Excluir tudo</button>
        <details className="rounded-lg border px-3 py-2 text-sm">
          <summary className="cursor-pointer">Mais opções</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="rounded-lg border px-3 py-1" onClick={() => setView('timeGridDay')}>Visualizar dia</button>
            <button className="rounded-lg border px-3 py-1" onClick={() => exportAsExcel(tasks)}>Exportar Excel</button>
            <button className="rounded-lg border px-3 py-1" onClick={() => exportAsDocx(tasks)}>Exportar DOCX</button>
            <button className="rounded-lg border px-3 py-1" onClick={async () => {
              const el = document.getElementById('planner-grid');
              if (el) await exportAsPdf(el);
            }}>Exportar PDF</button>
            <button className="rounded-lg border px-3 py-1" onClick={async () => {
              const el = document.getElementById('planner-grid');
              if (el) await exportAsPng(el);
            }}>Exportar PNG</button>
            <button className="rounded-lg border px-3 py-1" onClick={handleExportHtml}>Exportar HTML (visualização)</button>
            <button className="rounded-lg border px-3 py-1" onClick={() => fileInputRef.current?.click()}>Importar HTML exportado</button>
            <input ref={fileInputRef} type="file" accept=".html,text/html" className="hidden" onChange={handleImportFile} />
          </div>
        </details>
      </div>

      <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
        <strong>Importação segura:</strong> o sistema aceita apenas arquivos <strong>HTML exportados por este próprio app</strong>. Arquivos alterados manualmente ou fora do padrão serão recusados para evitar erros.
      </p>

      <section className="card flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Filtrar por categoria</span>
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600 dark:text-slate-300">Ir para data</span>
          <input type="date" className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={jumpToDate} onChange={(e) => setJumpToDate(e.target.value)} />
        </label>
      </section>

      <section className="card">
        <h2 className="mb-2 text-sm font-semibold">Legenda de categorias</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {legendItems.length === 0 && <span className="text-slate-600 dark:text-slate-300">Nenhuma categoria cadastrada ainda. Crie uma tarefa para aparecer aqui automaticamente.</span>}
          {legendItems.map(([category, color]) => (
            <span key={category} className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              {category}
            </span>
          ))}
        </div>
      </section>

      {warnings > 0 && <p className="rounded-lg bg-amber-100 p-3 text-amber-700">Existem {warnings} conflito(s) de horário.</p>}
      <TaskForm onAdd={handleAddTask} />
      <PlannerCalendar
        events={filteredTasks}
        view={view}
        compact={compact}
        slotMinTime="05:00:00"
        slotMaxTime="23:59:00"
        jumpToDate={jumpToDate}
        onEventChange={(updated) => setTasks((prev) => updateEventTime(prev, updated))}
        onEventDelete={removeTask}
      />
      <section className="card md:hidden">
        <h2 className="mb-2 font-semibold">Modo lista (mobile)</h2>
        {filteredTasks.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-300">Nenhuma tarefa cadastrada ainda.</p>}
        <ul className="space-y-2 text-sm">
          {filteredTasks.map((task) => (
            <li key={task.id} className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-slate-600 dark:text-slate-300">{new Date(task.start).toLocaleString('pt-BR')} - {new Date(task.end).toLocaleTimeString('pt-BR')}</p>
                </div>
                <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600" onClick={() => removeTask(task.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}