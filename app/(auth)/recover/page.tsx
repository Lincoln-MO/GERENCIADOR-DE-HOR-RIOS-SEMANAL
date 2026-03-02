export default function RecoverPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <form className="card space-y-4">
        <h1 className="text-2xl font-bold">Recuperação de senha</h1>
        <input className="w-full rounded-lg border p-2" type="email" placeholder="Seu e-mail" />
        <button className="w-full rounded-lg bg-brand py-2 text-white">Enviar link</button>
      </form>
    </main>
  );
}