# Gerenciador de Horários Semanal

Aplicação em **Next.js 15** para organizar tarefas recorrentes de uma agenda semanal, com integração ao Supabase e exportações.

## Requisitos

- Node.js 20+
- npm 10+

## Configuração local

1. Instale dependências:
   - `npm install`
   - Se seu ambiente tiver proxy corporativo bloqueando o npm registry, use: `bash scripts/install-no-proxy.sh`
2. Configure variáveis de ambiente em `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Rode em desenvolvimento:
   - `npm run dev`

## Build e execução em produção

- Build padrão: `npm run build`
- Start padrão: `npm run start`

## Deploy no Vercel

- O repositório já possui `vercel.json` configurado para usar `npm run vercel-build`.
- Configure as variáveis de ambiente do Supabase no painel da Vercel.

## Deploy na Hostinger (Node.js)

- Build: `npm run hostinger:build`
- Start: `npm run hostinger:start`
- Garanta `NODE_ENV=production` e as variáveis de ambiente do Supabase.

> Observação: este projeto usa `output: 'standalone'` no Next.js para facilitar execução em hospedagem Node.

## Verificação de saúde

Após deploy em qualquer provedor, valide:

- `https://SEU_DOMINIO/api/health`

Para instruções detalhadas, consulte `DEPLOY_VERCEL_HOSTINGER.md`.