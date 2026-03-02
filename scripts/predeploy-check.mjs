const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.warn('[predeploy-check] Variáveis ausentes:', missing.join(', '));
  console.warn('[predeploy-check] O build pode concluir, mas recursos Supabase não funcionarão sem essas variáveis.');
} else {
  console.log('[predeploy-check] OK: variáveis críticas encontradas.');
}