import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FiArrowRight, FiCalendar, FiClock, FiRotateCcw, FiUser } from "react-icons/fi";
import Ticket from "../interface";
import { EditTicketModal } from "../components/ticket/edit-modal";
import { updateTicketStatus } from "../actions";
import { formatElapsedTime, normalizeTicketStatus, ticketStatusOptions } from "../ticket-status";
import { WorkTimer } from "../components/ticket/work-timer";

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function getNextStatus(status: string) {
    const normalizedStatus = normalizeTicketStatus(status);
    const currentIndex = ticketStatusOptions.findIndex((option) => option.value === normalizedStatus);

    if (currentIndex < 0 || currentIndex === ticketStatusOptions.length - 1) {
        return ticketStatusOptions[0];
    }

    return ticketStatusOptions[currentIndex + 1];
}

export default async function FollowupPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/");
    }

    const tickets = await prisma.ticket.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            customer: true,
        },
        orderBy: [
            {
                updatedAt: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
    }) as Ticket[];

    const normalizedTickets = tickets.map((ticket) => ({
        ...ticket,
        normalizedStatus: normalizeTicketStatus(ticket.status),
    }));

    const mappedTickets = normalizedTickets.filter((ticket) =>
        ticketStatusOptions.some((column) => column.value === ticket.normalizedStatus),
    );

    const unmappedTickets = normalizedTickets.filter((ticket) =>
        ticketStatusOptions.every((column) => column.value !== ticket.normalizedStatus),
    );

    return (
        <Container>
            <main className="mb-10 mt-8">
                <div>
                    <span className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Acompanhamento</span>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Follow-up dos chamados</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                        Visualize a fila por etapa, encontre atendimentos parados e atualize o status sem sair do painel.
                    </p>
                </div>

                <section className="mt-8 grid gap-4 lg:grid-cols-4" aria-label="Fluxo dos chamados por status">
                    {ticketStatusOptions.map((column) => {
                        const columnTickets = mappedTickets.filter((ticket) => ticket.normalizedStatus === column.value);

                        return (
                            <article key={column.value} className="min-h-96 rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <header className="border-b border-slate-200 p-4 dark:border-slate-800">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold text-slate-950 dark:text-white">{column.label}</h2>
                                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{column.description}</p>
                                        </div>
                                        <span className={`inline-flex min-w-8 items-center justify-center rounded-md px-2 py-1 text-sm font-bold ${column.badgeClass}`}>
                                            {columnTickets.length}
                                        </span>
                                    </div>
                                </header>

                                <div className="flex flex-col gap-3 p-3">
                                    {columnTickets.length > 0 ? (
                                        columnTickets.map((ticket) => {
                                            const nextStatus = getNextStatus(ticket.normalizedStatus);
                                            const isClosed = ticket.normalizedStatus === "FECHADO";

                                            return (
                                                <div key={ticket.id} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">{ticket.subject}</h3>
                                                            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{ticket.description}</p>
                                                        </div>
                                                        <EditTicketModal ticket={{
                                                            id: ticket.id,
                                                            subject: ticket.subject,
                                                            description: ticket.description,
                                                            status: ticket.status,
                                                        }} />
                                                    </div>

                                                    <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiUser className="shrink-0" size={14} />
                                                            {ticket.customer?.name || "Cliente não especificado"}
                                                        </span>
                                                        <span className="inline-flex items-center gap-2">
                                                            <FiCalendar className="shrink-0" size={14} />
                                                            Criado em {formatDate(ticket.createdAt)}
                                                        </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <FiClock className="shrink-0" size={14} />
                                                        {ticket.normalizedStatus === "EM_ANDAMENTO"
                                                            ? `Em atendimento há ${formatElapsedTime(ticket.updatedAt || ticket.createdAt)}`
                                                            : `Atualizado há ${formatElapsedTime(ticket.updatedAt || ticket.createdAt)}`}
                                                    </span>
                                                </div>

                                                {ticket.normalizedStatus === "EM_ANDAMENTO" && (
                                                    <WorkTimer
                                                        ticketId={ticket.id}
                                                        workTimeSeconds={ticket.workTimeSeconds}
                                                        activeWorkStartedAt={ticket.activeWorkStartedAt}
                                                        compact
                                                    />
                                                )}

                                                <form action={updateTicketStatus} className="mt-4">
                                                        <input type="hidden" name="ticketId" value={ticket.id} />
                                                        <input type="hidden" name="status" value={nextStatus.value} />
                                                        <button
                                                            type="submit"
                                                            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:text-white"
                                                        >
                                                            {isClosed ? <FiRotateCcw size={15} /> : <FiArrowRight size={15} />}
                                                            {isClosed ? "Reabrir" : `Mover para ${nextStatus.label.toLowerCase()}`}
                                                        </button>
                                                    </form>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="rounded-md border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                            Nenhum chamado nesta etapa.
                                        </p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </section>

                {unmappedTickets.length > 0 && (
                    <section className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10" aria-label="Chamados com status fora do fluxo">
                        <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Chamados com status não mapeado</h2>
                        <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/80">
                            Atualize estes chamados para uma das etapas do follow-up.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {unmappedTickets.map((ticket) => (
                                <div key={ticket.id} className="rounded-md border border-amber-200 bg-white p-4 dark:border-amber-500/20 dark:bg-slate-900">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{ticket.subject}</h3>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Status atual: {ticket.status}</p>
                                        </div>
                                        <EditTicketModal ticket={{
                                            id: ticket.id,
                                            subject: ticket.subject,
                                            description: ticket.description,
                                            status: ticket.status,
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </Container>
    );
}
