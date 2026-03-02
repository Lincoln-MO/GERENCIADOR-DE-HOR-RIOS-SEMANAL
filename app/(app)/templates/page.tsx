import { builtInTemplates } from '@/mvc/models/template.model';

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Templates prontos</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {builtInTemplates.map((template) => (
          <article key={template.id} className="card">
            <h2 className="font-semibold">{template.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{template.description}</p>
            <button className="mt-3 rounded-lg bg-brand px-3 py-2 text-sm text-white">Aplicar template</button>
          </article>
        ))}
      </div>
    </main>
  );
}