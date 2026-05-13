import { Container } from '@/components/container';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TicketItem } from './components/ticket';
import { FiActivity, FiCheckCircle, FiClock, FiPlus, FiUsers } from 'react-icons/fi';
import prisma from '@/lib/prisma';
import Ticket from './interface';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/');
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  }) as Ticket[]

  const openTickets = tickets.filter((ticket) => ticket.status.toUpperCase() === 'ABERTO').length;
  const resolvedTickets = tickets.filter((ticket) => {
    const status = ticket.status.toUpperCase();
    return status === 'FECHADO' || status === 'RESOLVIDO';
  }).length;
  const uniqueCustomers = new Set(tickets.map((ticket) => ticket.customerId).filter(Boolean)).size;
  const recentTickets = tickets.filter((ticket) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return ticket.createdAt >= sevenDaysAgo;
  }).length;

  const metrics = [
    {
      label: 'Chamados abertos',
      value: openTickets,
      helper: `${tickets.length} chamado${tickets.length === 1 ? '' : 's'} no total`,
      icon: FiActivity,
      className: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-300',
    },
    {
      label: 'Resolvidos',
      value: resolvedTickets,
      helper: 'Fechados ou resolvidos',
      icon: FiCheckCircle,
      className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
    {
      label: 'Clientes atendidos',
      value: uniqueCustomers,
      helper: 'Com chamados registrados',
      icon: FiUsers,
      className: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300',
    },
    {
      label: 'Últimos 7 dias',
      value: recentTickets,
      helper: 'Novos chamados recentes',
      icon: FiClock,
      className: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300',
    },
  ];

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

        <section className='mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4' aria-label='Métricas dos chamados'>
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article key={metric.label} className='rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>{metric.label}</p>
                    <strong className='mt-2 block text-3xl font-bold text-slate-950 dark:text-white'>{metric.value}</strong>
                  </div>
                  <span className={`inline-flex size-10 items-center justify-center rounded-md ${metric.className}`}>
                    <Icon size={20} />
                  </span>
                </div>
                <p className='mt-4 text-sm text-slate-600 dark:text-slate-400'>{metric.helper}</p>
              </article>
            )
          })}
        </section>

        <div className='mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <table className='min-w-full'>
            <thead className='bg-slate-50 dark:bg-slate-950/60'>
              <tr className='h-11 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400'>
                <th className='text-left font-semibold pl-4'>Título</th>
                <th className='text-left font-semibold pl-4'>Cliente</th>
                <th className='text-left font-semibold pl-4 hidden sm:table-cell'>Data cadastro</th>
                <th className='text-left font-semibold pl-4'>Status</th>
                <th className='text-left font-semibold pl-4'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (<TicketItem key={ticket.id} ticket={ticket} />))
              ) : (
                <tr>
                  <td colSpan={5} className='px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400'>
                    Nenhum chamado encontrado. Crie um chamado para começar a acompanhar suas métricas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </Container>
  );
}
