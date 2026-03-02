import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/mvc/views/layout/app-shell.view';

export const metadata: Metadata = {
  title: 'TimePlanner Pro',
  description: 'Gerenciador inteligente de horários semanais com Next.js e Supabase.',
  openGraph: {
    title: 'TimePlanner Pro',
    description: 'Planeje sua semana com analytics, templates e sincronização inteligente.',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}