'use client';
import Link from 'next/link';
import { FiUser, FiLogOut, FiLoader, FiLock } from 'react-icons/fi';
import {signIn, useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '../theme-toggle';

export function Header() {
  const { status } = useSession();


  async function handleLogin() {
    await signIn();
  }

  async function handleLogout() {
    await signOut();
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link href="/">
          <h1 className="font-bold text-xl tracking-tight sm:text-2xl">
            <span className="text-sky-600 dark:text-sky-400">DEV</span> CONTROLE
          </h1>
        </Link>

        <div className="flex items-center gap-2">
        <ThemeToggle />
        { status === 'loading' && (
          <FiLoader
            size={26}
            className="animate-spin text-slate-600 dark:text-slate-300"
            role="status"
            aria-label="Carregando sessão"
          />
        )}
        { status === 'unauthenticated' && (
          <button type="button" aria-label="Entrar" onClick={handleLogin} className="inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300">
            <FiLock size={18} />
          </button>
        )}
        { status === 'authenticated' && (
          <div className="flex items-center gap-2">
          <Link href="/dashboard" aria-label="Dashboard" className="inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300">
            <FiUser size={18} />
          </Link>
          <button type="button" aria-label="Sair" onClick={handleLogout} className="inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300">
            <FiLogOut size={18} />
          </button>
        </div>
        )}
        </div>
      </div>
    </header>
  );
}
