"use client";

import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, Tooltip);

interface ChartPoint {
    label: string;
    value: number;
}

interface VitalChartPoint extends ChartPoint {
    metric: string;
}

interface ObservabilityChartsProps {
    vitalsByRating: ChartPoint[];
    p75ByMetric: VitalChartPoint[];
}

const ratingColors: Record<string, string> = {
    Bom: "#059669",
    Atenção: "#d97706",
    Ruim: "#dc2626",
};

const metricColors: Record<string, string> = {
    LCP: "#0284c7",
    INP: "#7c3aed",
    CLS: "#0891b2",
};

const textColor = "#64748b";
const gridColor = "rgba(148, 163, 184, 0.24)";

export function ObservabilityCharts({ vitalsByRating, p75ByMetric }: ObservabilityChartsProps) {
    return (
        <section className="mt-8 grid gap-6 xl:grid-cols-2" aria-label="Gráficos de observabilidade">
            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Qualidade dos Core Web Vitals</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Distribuição dos ratings coletados nos últimos 30 dias.</p>
                </div>
                <div className="h-80">
                    <Bar
                        data={{
                            labels: vitalsByRating.map((item) => item.label),
                            datasets: [
                                {
                                    label: "Coletas",
                                    data: vitalsByRating.map((item) => item.value),
                                    backgroundColor: vitalsByRating.map((item) => ratingColors[item.label] || "#64748b"),
                                    borderRadius: 6,
                                    maxBarThickness: 52,
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
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">P75 por métrica</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Percentil 75 calculado a partir das coletas recentes.</p>
                </div>
                <div className="h-80">
                    <Bar
                        data={{
                            labels: p75ByMetric.map((item) => item.label),
                            datasets: [
                                {
                                    label: "P75",
                                    data: p75ByMetric.map((item) => item.value),
                                    backgroundColor: p75ByMetric.map((item) => metricColors[item.metric] || "#64748b"),
                                    borderRadius: 6,
                                    maxBarThickness: 52,
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
        </section>
    );
}
