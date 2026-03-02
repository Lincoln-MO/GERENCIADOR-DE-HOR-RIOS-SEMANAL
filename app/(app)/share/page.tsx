export default function SharePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold">Compartilhamento</h1>
      <div className="card mt-4 space-y-3">
        <p>Gere links públicos, privados ou somente leitura e exporte versão para redes sociais.</p>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border px-3 py-2">Gerar link público</button>
          <button className="rounded-lg border px-3 py-2">Gerar somente visualização</button>
          <button className="rounded-lg border px-3 py-2">Exportar para Instagram</button>
        </div>
      </div>
    </main>
  );
}