'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { builtInTemplates } from '@/mvc/models/template.model';
import { TaskEvent } from '@/mvc/models/task.model';

const HIDDEN_TEMPLATES_KEY = 'timeplanner:hiddenTemplates';
const TASKS_STORAGE_KEY = 'timeplanner:tasks';

function applyTemplateToCurrentWeek(templateTasks: TaskEvent[]) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  return templateTasks.map((task) => {
    const templateStart = new Date(task.start);
    const templateEnd = new Date(task.end);

    const start = new Date(startOfWeek);
    start.setDate(startOfWeek.getDate() + task.dayOfWeek);
    start.setHours(templateStart.getHours(), templateStart.getMinutes(), 0, 0);

    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + task.dayOfWeek);
    end.setHours(templateEnd.getHours(), templateEnd.getMinutes(), 0, 0);

    return {
      ...task,
      id: crypto.randomUUID(),
      scheduleId: 'default',
      start: start.toISOString(),
      end: end.toISOString()
    };
  });
}

export default function TemplatesPage() {
  const router = useRouter();
  const [hiddenTemplateIds, setHiddenTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(HIDDEN_TEMPLATES_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setHiddenTemplateIds(parsed);
      }
    } catch {
      localStorage.removeItem(HIDDEN_TEMPLATES_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HIDDEN_TEMPLATES_KEY, JSON.stringify(hiddenTemplateIds));
  }, [hiddenTemplateIds]);

  const visibleTemplates = useMemo(
    () => builtInTemplates.filter((template) => !hiddenTemplateIds.includes(template.id)),
    [hiddenTemplateIds]
  );

  const hideTemplate = (id: string) => {
    setHiddenTemplateIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const applyTemplate = (templateId: string) => {
    const selectedTemplate = builtInTemplates.find((template) => template.id === templateId);
    if (!selectedTemplate) return;

    const confirmed = window.confirm(`Aplicar o template "${selectedTemplate.name}"? Isso vai substituir as tarefas atuais do planner.`);
    if (!confirmed) return;

    const preparedTasks = applyTemplateToCurrentWeek(selectedTemplate.structureJson);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(preparedTasks));
    router.push('/planner');
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Modelos prontos</h1>
        <button
          className="rounded-lg border px-3 py-2 text-sm"
          onClick={() => setHiddenTemplateIds([])}
          disabled={hiddenTemplateIds.length === 0}
        >
          Restaurar modelos
        </button>
      </div>

      {visibleTemplates.length === 0 && (
        <p className="card text-sm text-slate-600 dark:text-slate-300">
          Nenhum modelo visível no momento. Clique em <strong>Restaurar modelos</strong> para voltar os padrões.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {visibleTemplates.map((template) => (
          <article key={template.id} className="card">
            <h2 className="font-semibold">{template.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{template.description}</p>
            <div className="mt-3 flex gap-2">
              <button className="rounded-lg bg-brand px-3 py-2 text-sm text-white" onClick={() => applyTemplate(template.id)}>Aplicar</button>
              <button
                className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
                onClick={() => hideTemplate(template.id)}
              >
                Ocultar
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}