"use client";

import type { ReactNode } from "react";

/** Faixa de envelhecimento de chamados em andamento (WIP). */
export type AgingWipBucket = Readonly<{
    label: string;
    count: number;
    minDays: number;
    maxDays: number | null;
}>;

/** Célula do mapa de calor de tempo de resposta (dia da semana × hora). */
export type ResponseTimeHeatmapCell = Readonly<{
    dayOfWeek: number;
    hour: number;
    value: number;
    label?: string;
}>;

export type TicketWorkflowInsightsProps = Readonly<{
    agingWip: AgingWipBucket[];
    responseTimeHeatmap: ResponseTimeHeatmapCell[];
    isLoading?: boolean;
}>;

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const hourLabels = ["0h", "6h", "12h", "18h"] as const;

const chartAreaClassName =
    "flex h-80 min-h-80 max-h-80 flex-col overflow-hidden";

const canvasClassName =
    "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40";

function ChartPanel({
    title,
    description,
    testId,
    children,
}: Readonly<{
    title: string;
    description: string;
    testId: string;
    children: ReactNode;
}>) {
    return (
        <article
            className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            data-testid={testId}
        >
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            {children}
        </article>
    );
}

function AgingWipChartArea({ buckets, isLoading }: Readonly<{ buckets: AgingWipBucket[]; isLoading: boolean }>) {
    const hasData = buckets.length > 0;

    return (
        <div
            className={chartAreaClassName}
            aria-label="Gráfico de envelhecimento de chamados em andamento"
            data-chart="aging-wip"
        >
            {isLoading ? (
                <div className="flex min-h-0 flex-1 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Carregando envelhecimento WIP…</p>
                </div>
            ) : (
                <div
                    id="aging-wip-chart-canvas"
                    className={canvasClassName}
                    data-role="chart-canvas-target"
                    data-has-data={hasData}
                >
                    {!hasData && (
                        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Gráfico de envelhecimento (WIP)</p>
                            <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
                                Aqui será renderizado o gráfico de chamados em andamento por faixa de tempo na fila.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ResponseTimeHeatmapArea({
    cells,
    isLoading,
}: Readonly<{ cells: ResponseTimeHeatmapCell[]; isLoading: boolean }>) {
    const hasData = cells.length > 0;

    return (
        <div
            className={chartAreaClassName}
            aria-label="Mapa de calor de tempo de resposta"
            data-chart="response-time-heatmap"
        >
            {isLoading ? (
                <div className="flex min-h-0 flex-1 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Carregando mapa de calor…</p>
                </div>
            ) : (
                <div
                    id="response-time-heatmap-canvas"
                    className={canvasClassName}
                    data-role="chart-canvas-target"
                    data-has-data={hasData}
                >
                    {!hasData ? (
                        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mapa de calor de tempo de resposta</p>
                                <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                                    Aqui será renderizado o heatmap por dia da semana e hora.
                                </p>
                            </div>
                            <HeatmapGridSkeleton />
                        </div>
                    ) : (
                        <HeatmapGrid cells={cells} />
                    )}
                </div>
            )}
        </div>
    );
}

function HeatmapGridSkeleton() {
    return (
        <div
            className="w-full max-w-md shrink-0 opacity-40"
            aria-hidden
            data-role="heatmap-grid-skeleton"
        >
            <div className="grid grid-cols-8 gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <span />
                {weekdayLabels.map((day) => (
                    <span key={day} className="text-center">
                        {day}
                    </span>
                ))}
            </div>
            {hourLabels.map((hour) => (
                <div key={hour} className="mt-1 grid grid-cols-8 gap-1">
                    <span className="pr-1 text-right text-[10px] font-medium text-slate-500 dark:text-slate-400">{hour}</span>
                    {weekdayLabels.map((day) => (
                        <div
                            key={`${hour}-${day}`}
                            className="h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

function HeatmapGrid({ cells }: Readonly<{ cells: ResponseTimeHeatmapCell[] }>) {
    return (
        <div className="sr-only" role="img" aria-label="Mapa de calor com dados de tempo de resposta">
            {cells.length} células
        </div>
    );
}

export function TicketWorkflowInsights({
    agingWip,
    responseTimeHeatmap,
    isLoading = false,
}: TicketWorkflowInsightsProps) {
    return (
        <section
            className="mt-8 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
            aria-label="Envelhecimento WIP e tempo de resposta"
        >
            <ChartPanel
                title="Envelhecimento de chamados (WIP)"
                description="Distribuição de chamados em andamento pelo tempo na fila."
                testId="aging-wip-panel"
            >
                <AgingWipChartArea buckets={agingWip} isLoading={isLoading} />
            </ChartPanel>

            <ChartPanel
                title="Tempo de resposta"
                description="Mapa de calor da média de resposta por dia da semana e hora."
                testId="response-time-heatmap-panel"
            >
                <ResponseTimeHeatmapArea cells={responseTimeHeatmap} isLoading={isLoading} />
            </ChartPanel>
        </section>
    );
}
