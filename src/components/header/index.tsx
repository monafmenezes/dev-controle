'use client';
import Link from 'next/link';
import { FiUser, FiLogOut, FiLoader, FiLock } from 'react-icons/fi';
import {signIn, useSession, signOut } from 'next-auth/react';

export function Header() {
  const { status } = useSession();


  async function handleLogin() {
    await signIn();
  }

  async function handleLogout() {
    await signOut();
  }

  return (
    <header className="w-full flex items-center px-2 py-4 bg-white h-20 shadow-sm">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link href="/">
          <h1 className="font-bold text-2xl pl-1 hover:tracking-widest transition-all duration-300">
            <span className="text-blue-500">DEV</span> CONTROLE
          </h1>
        </Link>

        { status === 'loading' && <FiLoader size={26} color='#4b5563' className='animate-spin' /> }
        { status === 'unauthenticated' && (
          <button>
            <FiLock size={26} color="#4b5563" onClick={handleLogin} />
          </button>
        )}
        { status === 'authenticated' && (
          <div className="flex items-baseline gap-4">
          <Link href="/dashboard">
            <FiUser size={26} color="#4b5563" />
          </Link>
          <button onClick={handleLogout}>
            <FiLogOut size={26} color="#4b5563" />
          </button>
        </div>
        )}
      </div>
    </header>
  );
}
