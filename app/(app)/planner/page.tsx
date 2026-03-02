'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PlannerCalendar } from '@/mvc/views/calendar/planner-calendar.view';
import { TaskForm } from '@/mvc/views/calendar/task-form.view';
import { CalendarView, TaskEvent, hasConflict } from '@/mvc/models/task.model';

import { exportAsDocx, exportAsExcel, exportAsPdf, exportAsPng } from '@/mvc/controllers/export.controller';
import { addTaskWithConflictCheck, duplicateWeek, updateEventTime } from '@/mvc/controllers/planner.controller';

const STORAGE_KEY = 'timeplanner:tasks';
const EXPORT_VERSION = '1.0';
const EXPORT_SCRIPT_ID = 'timeplanner-export-data';

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

  const handleAddTask = (newTasks: TaskEvent[]) => {
    const hasAnyConflict = newTasks.some((task) => hasConflict(task, tasks));

    const allowOverlap = !hasAnyConflict
      ? true
      : window.confirm('Conflito detectado em uma ou mais tarefas. Deseja permitir sobreposição?');

    if (!allowOverlap) return;

    setTasks((prev) => newTasks.reduce((acc, task) => addTaskWithConflictCheck(acc, task, allowOverlap), prev));
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

    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planejamento exportado</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 0; background: #0b132b; color: #e2e8f0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .header { background: #111c44; border: 1px solid #26335f; border-radius: 14px; padding: 16px; margin-bottom: 18px; }
    .subtitle { color: #93a4d1; margin-top: 8px; font-size: 14px; }
    .week-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; margin: 10px 0; }
    .week-nav { display: flex; gap: 8px; }
    .btn { background: #0f1738; border: 1px solid #2a3a66; color: #e2e8f0; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
    .week-title { font-weight: 600; color: #c7d3f6; }
    .week-grid { display: grid; grid-template-columns: repeat(7, minmax(180px, 1fr)); gap: 10px; overflow-x: auto; }
    .day-column { background: #111c44; border: 1px solid #26335f; border-radius: 12px; padding: 10px; min-height: 220px; }
    .day-column h3 { font-size: 14px; margin: 0 0 8px; }
    .day-column ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .task-item { background: #0f1738; border: 1px solid #1f2a52; border-left-width: 4px; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; gap: 3px; }
    .task-item strong { font-size: 13px; }
    .task-item span, .task-item small { font-size: 12px; color: #b8c4e8; }
    .empty { color: #8ea0cd; font-size: 12px; }
    .month-wrap { margin-top: 20px; background: #111c44; border: 1px solid #26335f; border-radius: 12px; padding: 12px; }
    .month-title { margin: 0 0 8px; }
    .calendar-head { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 8px; color: #9cb0df; font-size: 12px; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
    .calendar-cell { min-height: 74px; background: #0f1738; border: 1px solid #1f2a52; border-radius: 8px; padding: 8px; }
    .calendar-cell.muted { opacity: 0.35; }
    .calendar-top { display: flex; justify-content: space-between; align-items: center; }
    .bullets { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }
    .bullet { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
    .legend { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; }
    .legend-item { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #2a3a66; border-radius: 999px; padding: 4px 10px; font-size: 12px; color: #c6d4f7; }
    .note { margin-top: 16px; color: #93a4d1; font-size: 13px; }
  </style>
</head>
<body>
  <main class="container">
    <section class="header">
      <h1>Planejador Semanal — Exportação visual</h1>
      <p class="subtitle">Gerado em: ${new Date(payload.exportedAt).toLocaleString('pt-BR')} • Total de tarefas: ${tasks.length}</p>
    </section>

    <section>
      <h2 style="margin: 0 0 8px;">Visão semanal (como no site)</h2>
      <div class="week-toolbar">
        <div class="week-nav">
          <button class="btn" id="prev-week">Anterior</button>
          <button class="btn" id="next-week">Próximo</button>
        </div>
        <span class="week-title" id="week-title"></span>
      </div>
      <div class="week-grid" id="week-grid"></div>
    </section>

    <section class="month-wrap">
      <h2 class="month-title" id="month-title"></h2>
      <div class="calendar-head" id="calendar-head"></div>
      <div class="calendar-grid" id="calendar-grid"></div>
      <div class="legend" id="month-legend"></div>
    </section>

    <p class="note">Arquivo somente para visualização. Para editar, importe este HTML no sistema.</p>
  </main>

  <script id="${EXPORT_SCRIPT_ID}" type="application/timeplanner-export">${payloadBase64}</script>
  <script>
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    function dateKey(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `\${y}-\${m}-\${d}`;
    }

    function startOfWeek(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      return d;
    }

    const raw = document.getElementById('${EXPORT_SCRIPT_ID}').textContent.trim();
    const payload = JSON.parse(decodeURIComponent(escape(atob(raw))));
    const tasks = (payload.tasks || []).map((task) => ({ ...task, startDate: new Date(task.start), endDate: new Date(task.end) }));

    const tasksByDate = new Map();
    tasks.forEach((task) => {
      const key = dateKey(task.startDate);
      if (!tasksByDate.has(key)) tasksByDate.set(key, []);
      tasksByDate.get(key).push(task);
    });

    tasksByDate.forEach((value) => value.sort((a, b) => a.startDate - b.startDate));

    let currentWeek = startOfWeek(new Date(payload.exportedAt || new Date()));

    function renderWeek() {
      const grid = document.getElementById('week-grid');
      const weekTitle = document.getElementById('week-title');
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(currentWeek.getDate() + 6);

      weekTitle.textContent = `\${currentWeek.toLocaleDateString('pt-BR')} - \${weekEnd.toLocaleDateString('pt-BR')}`;

      let html = '';
      for (let i = 0; i < 7; i += 1) {
        const day = new Date(currentWeek);
        day.setDate(currentWeek.getDate() + i);
        const key = dateKey(day);
        const dayTasks = tasksByDate.get(key) || [];

        const cards = dayTasks.length
          ? dayTasks.map((task) => `
            <li class="task-item" style="border-left-color:\${task.color}">
              <strong>\${task.title}</strong>
              <span>\${task.startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - \${task.endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              <small>\${task.category}</small>
            </li>`).join('')
          : '<li class="empty">Sem tarefas</li>';

        html += `
          <article class="day-column">
            <h3>\${dayNames[day.getDay()]}, \${day.toLocaleDateString('pt-BR')}</h3>
            <ul>\${cards}</ul>
          </article>`;
      }

      grid.innerHTML = html;
    }

    function renderMonth() {
      const monthRef = new Date(currentWeek);
      const monthStart = new Date(monthRef.getFullYear(), monthRef.getMonth(), 1);
      const monthEnd = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0);

      document.getElementById('month-title').textContent = `Visão mensal (\${monthRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})`;
      document.getElementById('calendar-head').innerHTML = dayNames.map((d) => `<span>\${d}</span>`).join('');

      const cells = [];
      for (let i = 0; i < monthStart.getDay(); i += 1) {
        cells.push('<div class="calendar-cell muted"></div>');
      }

      const monthLegendMap = new Map();

      for (let day = 1; day <= monthEnd.getDate(); day += 1) {
        const current = new Date(monthRef.getFullYear(), monthRef.getMonth(), day);
        const key = dateKey(current);
        const dayTasks = tasksByDate.get(key) || [];

        dayTasks.forEach((task) => {
          if (!monthLegendMap.has(task.category)) monthLegendMap.set(task.category, task.color);
        });

        const bullets = dayTasks.slice(0, 4).map((task) =>
          `<span class="bullet" style="background:\${task.color}" title="\${task.title}"></span>`
        ).join('');

        cells.push(`
          <div class="calendar-cell">
            <div class="calendar-top">
              <strong>\${day}</strong>
              <div class="bullets">\${bullets}</div>
            </div>
          </div>`);
      }

      document.getElementById('calendar-grid').innerHTML = cells.join('');

      const legend = Array.from(monthLegendMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
        .map(([category, color]) => `<span class="legend-item"><span class="bullet" style="background:\${color}"></span>\${category}</span>`)
        .join('');

      document.getElementById('month-legend').innerHTML = legend || '<span class="empty">Sem categorias neste mês.</span>';
    }

    function renderAll() {
      renderWeek();
      renderMonth();
    }

    document.getElementById('prev-week').addEventListener('click', () => {
      currentWeek.setDate(currentWeek.getDate() - 7);
      currentWeek = startOfWeek(currentWeek);
      renderAll();
    });

    document.getElementById('next-week').addEventListener('click', () => {
      currentWeek.setDate(currentWeek.getDate() + 7);
      currentWeek = startOfWeek(currentWeek);
      renderAll();
    });

    renderAll();
  </script>
</body>
</html>`;

    downloadFile(`planejamento-visual-${new Date().toISOString().slice(0, 10)}.html`, html, 'text/html;charset=utf-8');
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const payloadScript = doc.getElementById(EXPORT_SCRIPT_ID);

    if (!payloadScript) {
      window.alert('Arquivo não reconhecido. Use apenas arquivos exportados por este sistema.');
      event.target.value = '';
      return;
    }

    try {
      const base64 = (payloadScript.textContent || '').trim();
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