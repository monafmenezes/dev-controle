import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "../../../../generated/prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiExternalLink, FiZap } from "react-icons/fi";
import { ObservabilityCharts } from "./observability-charts";
import { UserManagement } from "./user-management";

type Rating = "good" | "needs-improvement" | "poor";

type WebVitalRecord = {
    id: string;
    name: string;
    value: number;
    rating: string;
    path: string;
    occurredAt: Date;
};

const metricOrder = ["LCP", "INP", "CLS"];
const ratingLabels: Record<Rating, string> = {
    good: "Bom",
    "needs-improvement": "Atenção",
    poor: "Ruim",
};

function getP75(values: number[]) {
    if (values.length === 0) {
        return 0;
    }

    const sortedValues = [...values].sort((a, b) => a - b);
    const index = Math.ceil(0.75 * sortedValues.length) - 1;

    return sortedValues[Math.max(index, 0)];
}

function formatMetricValue(name: string, value: number) {
    if (name === "CLS") {
        return value.toFixed(3);
    }

    return `${Math.round(value)} ms`;
}

function getSentryIssuesUrl() {
    const org = process.env.SENTRY_ORG;
    const project = process.env.SENTRY_PROJECT;

    if (!org) {
        return null;
    }

    const params = new URLSearchParams({
        query: "source:web-vitals",
    });

    if (project) {
        params.set("project", project);
    }

    return `https://${org}.sentry.io/issues/?${params.toString()}`;
}

function getSentryProjectUrl() {
    const org = process.env.SENTRY_ORG;
    const project = process.env.SENTRY_PROJECT;

    if (!org || !project) {
        return null;
    }

    return `https://${org}.sentry.io/projects/${org}/${project}/`;
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/");
    }

    if (session.user.role !== UserRole.ADMIN) {
        redirect("/dashboard");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalVitals, webVitals, users] = await Promise.all([
        prisma.monitoringWebVital.count({
            where: {
                occurredAt: {
                    gte: thirtyDaysAgo,
                },
            },
        }),
        prisma.monitoringWebVital.findMany({
            where: {
                occurredAt: {
                    gte: thirtyDaysAgo,
                },
            },
            select: {
                id: true,
                name: true,
                value: true,
                rating: true,
                path: true,
                occurredAt: true,
            },
            orderBy: {
                occurredAt: "desc",
            },
            take: 1000,
        }),
        prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
    ]);

    const records = webVitals as WebVitalRecord[];
    const badVitals = records.filter((item) => item.rating !== "good");
    const poorVitals = records.filter((item) => item.rating === "poor");
    const uniquePaths = new Set(records.map((item) => item.path)).size;
    const vitalsByRating = (["good", "needs-improvement", "poor"] as Rating[]).map((rating) => ({
        label: ratingLabels[rating],
        value: records.filter((item) => item.rating === rating).length,
    }));
    const p75ByMetric = metricOrder.map((metric) => {
        const p75 = getP75(records.filter((item) => item.name === metric).map((item) => item.value));

        return {
            label: metric === "CLS" ? `${metric} (${p75.toFixed(3)})` : `${metric} (${Math.round(p75)} ms)`,
            metric,
            value: Number(metric === "CLS" ? p75.toFixed(3) : Math.round(p75)),
        };
    });

    const byPath = new Map<string, { path: string; total: number; poor: number; needsImprovement: number }>();
    records.forEach((record) => {
        const current = byPath.get(record.path) || {
            path: record.path,
            total: 0,
            poor: 0,
            needsImprovement: 0,
        };

        current.total += 1;

        if (record.rating === "poor") {
            current.poor += 1;
        }

        if (record.rating === "needs-improvement") {
            current.needsImprovement += 1;
        }

        byPath.set(record.path, current);
    });

    const topPaths = Array.from(byPath.values())
        .sort((a, b) => {
            const badDiff = b.poor + b.needsImprovement - (a.poor + a.needsImprovement);

            if (badDiff !== 0) {
                return badDiff;
            }

            return b.total - a.total;
        })
        .slice(0, 5);

    const recentBadVitals = badVitals.slice(0, 8);
    const sentryIssuesUrl = getSentryIssuesUrl();
    const sentryProjectUrl = getSentryProjectUrl();
    const sentryStatus = [
        { label: "Server DSN", enabled: Boolean(process.env.SENTRY_DSN) },
        { label: "Browser DSN", enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) },
        { label: "Org", enabled: Boolean(process.env.SENTRY_ORG) },
        { label: "Project", enabled: Boolean(process.env.SENTRY_PROJECT) },
    ];

    const cards = [
        {
            label: "Coletas recentes",
            value: totalVitals,
            helper: "Core Web Vitals nos últimos 30 dias",
            icon: FiActivity,
            className: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
        },
        {
            label: "Alertas enviados",
            value: badVitals.length,
            helper: "Ratings atenção ou ruim também vão ao Sentry",
            icon: FiAlertTriangle,
            className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
        },
        {
            label: "Ocorrências ruins",
            value: poorVitals.length,
            helper: "Prioridade para investigação",
            icon: FiZap,
            className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
        },
        {
            label: "Rotas monitoradas",
            value: uniquePaths,
            helper: "Caminhos com telemetria recebida",
            icon: FiCheckCircle,
            className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
        },
    ];

    return (
        <Container>
            <main className="mb-10 mt-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Admin</span>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Painel de observabilidade</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                            Analise Core Web Vitals coletados pela aplicação e acompanhe os sinais encaminhados para o Sentry.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {sentryProjectUrl && (
                            <Link href={sentryProjectUrl} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                                Projeto Sentry
                                <FiExternalLink size={16} />
                            </Link>
                        )}
                        {sentryIssuesUrl && (
                            <Link href={sentryIssuesUrl} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                                Issues Web Vitals
                                <FiExternalLink size={16} />
                            </Link>
                        )}
                    </div>
                </div>

                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo de observabilidade">
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

                <UserManagement
                    currentUserId={session.user.id}
                    users={users.map((user) => ({
                        ...user,
                        role: user.role ?? UserRole.USER,
                        createdAtLabel: user.createdAt.toLocaleDateString("pt-BR"),
                    }))}
                />

                {records.length > 0 ? (
                    <>
                        <ObservabilityCharts vitalsByRating={vitalsByRating} p75ByMetric={p75ByMetric} />

                        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                            <article className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Rotas com mais atenção</h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prioriza caminhos com mais ratings ruins ou em atenção.</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-950/60">
                                            <tr className="h-11 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                                <th className="pl-5 text-left font-semibold">Rota</th>
                                                <th className="px-4 text-left font-semibold">Atenção</th>
                                                <th className="px-4 text-left font-semibold">Ruim</th>
                                                <th className="px-4 text-left font-semibold">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topPaths.map((item) => (
                                                <tr key={item.path} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                                                    <td className="max-w-72 truncate py-3 pl-5 pr-4 text-sm font-medium text-slate-950 dark:text-white">{item.path}</td>
                                                    <td className="px-4 py-3 text-sm text-amber-700 dark:text-amber-300">{item.needsImprovement}</td>
                                                    <td className="px-4 py-3 text-sm text-rose-700 dark:text-rose-300">{item.poor}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </article>

                            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Configuração do Sentry</h2>
                                <div className="mt-4 space-y-3">
                                    {sentryStatus.map((item) => (
                                        <div key={item.label} className="flex items-center justify-between gap-4 rounded-md border border-slate-200 px-3 py-2 dark:border-slate-800">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                            <span className={`rounded px-2 py-1 text-xs font-semibold ${item.enabled ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}>
                                                {item.enabled ? "Configurado" : "Pendente"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                                    Métricas com rating atenção ou ruim são capturadas como mensagens no Sentry com a tag <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">source:web-vitals</code>.
                                </p>
                            </article>
                        </section>

                        <section className="mt-8 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Eventos recentes para investigar</h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Últimas coletas em atenção ou ruins, iguais às enviadas para o Sentry.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-950/60">
                                        <tr className="h-11 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                            <th className="pl-5 text-left font-semibold">Métrica</th>
                                            <th className="px-4 text-left font-semibold">Valor</th>
                                            <th className="px-4 text-left font-semibold">Rating</th>
                                            <th className="px-4 text-left font-semibold">Rota</th>
                                            <th className="px-4 text-left font-semibold">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBadVitals.length > 0 ? (
                                            recentBadVitals.map((item) => (
                                                <tr key={item.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                                                    <td className="py-3 pl-5 pr-4 text-sm font-semibold text-slate-950 dark:text-white">{item.name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatMetricValue(item.name, item.value)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{ratingLabels[item.rating as Rating] || item.rating}</td>
                                                    <td className="max-w-72 truncate px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.path}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.occurredAt.toLocaleString("pt-BR")}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                                                    Nenhuma coleta em atenção ou ruim no período.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="mt-8 rounded-md border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Sem telemetria para exibir</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Acesse a aplicação em um navegador para gerar coletas de Core Web Vitals.
                        </p>
                    </section>
                )}
            </main>
        </Container>
    );
}
