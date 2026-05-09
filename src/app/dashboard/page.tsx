import { Container } from '@/components/container';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TicketItem } from './components/ticket';
import { FiPlus } from 'react-icons/fi';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/');
  }

  return (
    <Container>
      <main className='mb-10 mt-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <span className='text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300'>Atendimento</span>
            <h1 className='mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white'>Chamados</h1>
            <p className='mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400'>Acompanhe solicitações abertas e mantenha o histórico de atendimento organizado.</p>
          </div>
          <Link href="/dashboard/new" className='inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400'>
            <FiPlus size={18} />
            Abrir chamado
          </Link>
        </div>

        <div className='mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <table className='min-w-full'>
            <thead className='bg-slate-50 dark:bg-slate-950/60'>
              <tr className='h-11 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400'>
                <th className='text-left font-semibold pl-4'>Cliente</th>
                <th className='text-left font-semibold pl-4 hidden sm:table-cell'>Data cadastro</th>
                <th className='text-left font-semibold pl-4'>Status</th>
                <th className='text-left font-semibold pl-4'>Ações</th>
              </tr>
            </thead>
            <tbody>
              <TicketItem />
            </tbody>
          </table>
        </div>
      </main>
    </Container>
  );
}
