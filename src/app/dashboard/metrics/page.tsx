import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FiBarChart2, FiPieChart, FiUsers } from "react-icons/fi";
import Ticket from "../interface";
import { MetricsCharts } from "./charts";

function normalizeStatus(status: string) {
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === "OPEN") {
        return "ABERTO";
    }

    return normalizedStatus;
}

function formatStatus(status: string) {
    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function sortByValueDesc<T extends { value: number; label: string }>(items: T[]) {
    return [...items].sort((a, b) => {
        if (b.value !== a.value) {
            return b.value - a.value;
        }

        return a.label.localeCompare(b.label);
    });
}

export default async function MetricsPage() {
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
    }) as Ticket[];

    const byCustomer = new Map<string, number>();
    const byStatus = new Map<string, number>();

    tickets.forEach((ticket) => {
        const customerName = ticket.customer?.name || "Cliente não especificado";
        const status = normalizeStatus(ticket.status);

        byCustomer.set(customerName, (byCustomer.get(customerName) || 0) + 1);
        byStatus.set(status, (byStatus.get(status) || 0) + 1);
    });

    const ticketsByCustomer = sortByValueDesc(
        Array.from(byCustomer, ([label, value]) => ({ label, value })),
    );
    const ticketsByStatus = sortByValueDesc(
        Array.from(byStatus, ([status, value]) => ({ label: formatStatus(status), value })),
    );
    const topCustomer = ticketsByCustomer[0];

    const cards = [
        {
            label: "Total de chamados",
            value: tickets.length,
            helper: "Base usada nos gráficos",
            icon: FiBarChart2,
            className: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
        },
        {
            label: "Clientes com chamados",
            value: ticketsByCustomer.length,
            helper: "Clientes distintos",
            icon: FiUsers,
            className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        },
        {
            label: "Status diferentes",
            value: ticketsByStatus.length,
            helper: "Etapas em uso",
            icon: FiPieChart,
            className: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
        },
    ];

    return (
        <Container>
            <main className="mb-10 mt-8">
                <div>
                    <span className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Indicadores</span>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Métricas dos chamados</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                        Acompanhe a distribuição de chamados por cliente e por status para entender onde a fila está concentrada.
                    </p>
                </div>

                <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Resumo das métricas">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <article key={card.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                                        <strong className="mt-2 block text-3xl font-bold text-slate-950 dark:text-white">{card.value}</strong>
                                    </div>
                                    <span className={`inline-flex size-10 items-center justify-center rounded-md ${card.className}`}>
                                        <Icon size={20} />
                                    </span>
                                </div>
                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{card.helper}</p>
                            </article>
                        );
                    })}
                </section>

                {tickets.length > 0 ? (
                    <>
                        <MetricsCharts ticketsByCustomer={ticketsByCustomer} ticketsByStatus={ticketsByStatus} />

                        {topCustomer && (
                            <section className="mt-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Maior volume</h2>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    {topCustomer.label} concentra {topCustomer.value} chamado{topCustomer.value === 1 ? "" : "s"} no período atual.
                                </p>
                            </section>
                        )}
                    </>
                ) : (
                    <section className="mt-8 rounded-md border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Sem dados para exibir</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Crie chamados para visualizar os gráficos por cliente e status.
                        </p>
                    </section>
                )}
            </main>
        </Container>
    );
}
