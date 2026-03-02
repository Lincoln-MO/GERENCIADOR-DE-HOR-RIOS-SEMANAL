'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-bold">TimePlanner Pro</Link>
          <nav className="hidden gap-4 text-sm md:flex">
            <Link href="/planner">Planner</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/share">Compartilhar</Link>
          </nav>
          <button onClick={toggleTheme} className="rounded-lg border border-slate-300 p-2 dark:border-slate-700">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}