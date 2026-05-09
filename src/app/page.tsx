import Image from 'next/image';
import heroImg from '@/assets/hero.svg';

export default function Home() {
  return (
    <div className="flex-1">
      <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
        <span className="mb-4 rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-sm font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">Dev Controle</span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-6xl dark:text-white">
          Gerencie clientes e atendimentos com mais clareza
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
          Uma área simples para organizar sua operação diária, sem ruído visual e com acesso rápido ao que importa.
        </p>

        <Image
          src={heroImg}
          alt="Imagem Hero do Dev controle"
          width={600}
          priority
          className="mt-10 max-w-sm opacity-95 drop-shadow-2xl md:max-w-xl dark:opacity-90"
        />
      </main>
    </div>
  );
}
