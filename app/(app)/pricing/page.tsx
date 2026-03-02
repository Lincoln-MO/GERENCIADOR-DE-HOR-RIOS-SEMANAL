export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Planos futuros (Freemium)</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="card"><h2 className="font-semibold">Free</h2><p>Planner essencial e templates básicos.</p></section>
        <section className="card"><h2 className="font-semibold">Pro</h2><p>Sincronização Google e exportações avançadas.</p></section>
        <section className="card"><h2 className="font-semibold">Teams</h2><p>Colaboração, métricas e compartilhamento premium.</p></section>
      </div>
    </main>
  );
}