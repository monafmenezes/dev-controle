"use client";

import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

interface ChartPoint {
    label: string;
    value: number;
}

interface MetricsChartsProps {
    ticketsByCustomer: ChartPoint[];
    ticketsByStatus: ChartPoint[];
}

const colors = [
    "#0284c7",
    "#059669",
    "#7c3aed",
    "#d97706",
    "#dc2626",
    "#0891b2",
    "#4f46e5",
    "#65a30d",
];

const textColor = "#64748b";
const gridColor = "rgba(148, 163, 184, 0.24)";

export function MetricsCharts({ ticketsByCustomer, ticketsByStatus }: MetricsChartsProps) {
    const customerLabels = ticketsByCustomer.map((item) => item.label);
    const customerValues = ticketsByCustomer.map((item) => item.value);
    const statusLabels = ticketsByStatus.map((item) => item.label);
    const statusValues = ticketsByStatus.map((item) => item.value);

    return (
        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]" aria-label="Gráficos de métricas dos chamados">
            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Chamados por cliente</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Volume de chamados agrupado por cliente.</p>
                </div>
                <div className="h-80">
                    <Bar
                        data={{
                            labels: customerLabels,
                            datasets: [
                                {
                                    label: "Chamados",
                                    data: customerValues,
                                    backgroundColor: "#0284c7",
                                    borderRadius: 6,
                                    maxBarThickness: 42,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => `${context.parsed.y} chamado${context.parsed.y === 1 ? "" : "s"}`,
                                    },
                                },
                            },
                            scales: {
                                x: {
                                    grid: {
                                        display: false,
                                    },
                                    ticks: {
                                        color: textColor,
                                    },
                                },
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        color: textColor,
                                        precision: 0,
                                    },
                                    grid: {
                                        color: gridColor,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </article>

            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Chamados por status</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Distribuição atual da fila de atendimento.</p>
                </div>
                <div className="h-80">
                    <Doughnut
                        data={{
                            labels: statusLabels,
                            datasets: [
                                {
                                    data: statusValues,
                                    backgroundColor: statusLabels.map((_, index) => colors[index % colors.length]),
                                    borderColor: "rgba(255, 255, 255, 0.9)",
                                    borderWidth: 2,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: "64%",
                            plugins: {
                                legend: {
                                    position: "bottom",
                                    labels: {
                                        color: textColor,
                                        boxWidth: 12,
                                        boxHeight: 12,
                                    },
                                },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => `${context.label}: ${context.parsed} chamado${context.parsed === 1 ? "" : "s"}`,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </article>
        </section>
    );
}
