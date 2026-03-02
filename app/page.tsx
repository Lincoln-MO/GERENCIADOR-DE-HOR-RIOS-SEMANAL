import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-20">
      <section className="space-y-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">TimePlanner Pro</p>
        <h1 className="text-4xl font-bold md:text-6xl">Gerencie sua semana com inteligência</h1>
        <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
          Planejamento profissional com calendário avançado, dashboards, templates e exportações em PDF, DOCX,
          Excel e PNG.
        </p>
        <div className="flex justify-center gap-3">
          <Link className="rounded-xl bg-brand px-5 py-3 text-white hover:bg-brand-dark" href="/planner">Abrir Planner</Link>
          <Link className="rounded-xl border border-slate-300 px-5 py-3 hover:bg-slate-200 dark:border-slate-700 dark:hover:bg-slate-800" href="/pricing">Planos futuros</Link>
        </div>
      </section>
    </main>
  );
}