# Deploy prático — Vercel e Hostinger

## 1) Variáveis de ambiente obrigatórias
Configure em ambos provedores:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Vercel
1. Importar repositório no painel Vercel.
2. Framework detectado: Next.js.
3. Build Command: `npm run vercel-build`.
4. Install Command: `npm install`.
5. Adicionar variáveis de ambiente.
6. Deploy.

Health check após deploy:
- `https://SEU_DOMINIO/api/health`

## 3) Hostinger (Node.js)
1. Subir código do projeto.
2. Rodar:
   - `npm install`
   - `npm run hostinger:build`
3. Start command:
   - `npm run hostinger:start`
4. Garantir `NODE_ENV=production` e variáveis Supabase configuradas.

Health check após deploy:
- `https://SEU_DOMINIO/api/health`

## 4) Observações
- `next.config.ts` usa `output: 'standalone'` para facilitar deploy em host Node.
- Se o ambiente corporativo bloquear `npm install`, usar rede sem proxy/bloqueio para build (Vercel normalmente resolve isso automaticamente no CI deles).