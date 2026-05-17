import { Container } from '@/components/container';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TicketItem } from './components/ticket';
import { TicketWorkflowInsights } from './components/ticket-workflow-insights';
import { FiActivity, FiCheckCircle, FiClock, FiPlus, FiSearch, FiUsers, FiX } from 'react-icons/fi';
import prisma from '@/lib/prisma';
import Ticket from './interface';
import { normalizeTicketStatus, ticketStatusOptions } from './ticket-status';

type DashboardProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function includesText(value: string | null | undefined, query: string) {
  return (value || '').toLowerCase().includes(query);
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/');
  }

  const params = await searchParams;
  const q = getSearchParam(params.q);
  const status = getSearchParam(params.status);
  const searchQuery = q.trim().toLowerCase();
  const selectedStatus = status.toUpperCase();

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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = !searchQuery
      || includesText(ticket.subject, searchQuery)
      || includesText(ticket.description, searchQuery)
      || includesText(ticket.customer?.name, searchQuery);
    const matchesStatus = !selectedStatus || normalizeTicketStatus(ticket.status) === selectedStatus;

    return matchesSearch && matchesStatus;
  });

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

        <TicketWorkflowInsights agingWip={[]} responseTimeHeatmap={[]} />

        <section className='mt-6 rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900' aria-label='Filtros de chamados'>
          <form className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]' action='/dashboard'>
            <label className='relative block'>
              <span className='sr-only'>Buscar chamados</span>
              <FiSearch className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
              <input
                name='q'
                defaultValue={q}
                placeholder='Buscar por título, descrição ou cliente'
                className='h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400'
              />
            </label>
            <label>
              <span className='sr-only'>Filtrar por status</span>
              <select
                name='status'
                defaultValue={selectedStatus}
                className='h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400'
              >
                <option value=''>Todos os status</option>
                {ticketStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className='flex gap-2'>
              <button type='submit' className='inline-flex h-11 flex-1 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400'>
                Filtrar
              </button>
              {(searchQuery || selectedStatus) && (
                <Link href='/dashboard' aria-label='Limpar filtros' className='inline-flex size-11 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white'>
                  <FiX size={18} />
                </Link>
              )}
            </div>
          </form>
          <p className='mt-3 text-sm text-slate-500 dark:text-slate-400'>
            Exibindo {filteredTickets.length} de {tickets.length} chamado{tickets.length === 1 ? '' : 's'}.
          </p>
        </section>

        <div className='mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
          <table className='min-w-full'>
            <thead className='bg-slate-50 dark:bg-slate-950/60'>
              <tr className='h-11 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400'>
                <th className='text-left font-semibold pl-4'>Título</th>
                <th className='text-left font-semibold pl-4'>Cliente</th>
                <th className='text-left font-semibold pl-4 hidden sm:table-cell'>Data cadastro</th>
                <th className='text-left font-semibold pl-4'>Status e tempo</th>
                <th className='text-left font-semibold pl-4'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (<TicketItem key={ticket.id} ticket={ticket} />))
              ) : (
                <tr>
                  <td colSpan={5} className='px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400'>
                    Nenhum chamado encontrado para os filtros atuais.
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
