"use client";

import { useEffect, useMemo, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { pauseTicketWork, startTicketWork } from "../../actions";
import { formatWorkDuration, getTotalWorkSeconds } from "../../ticket-status";

interface WorkTimerProps {
    ticketId: string;
    workTimeSeconds?: number | null;
    activeWorkStartedAt?: Date | null;
    compact?: boolean;
}

function TimerButton({ isActive }: { isActive: boolean }) {
    return (
        <button
            type="submit"
            className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
        >
            {isActive ? <FiPause size={13} /> : <FiPlay size={13} />}
            {isActive ? "Pausar" : "Iniciar"}
        </button>
    );
}

export function WorkTimer({ ticketId, workTimeSeconds = 0, activeWorkStartedAt = null, compact = false }: WorkTimerProps) {
    const [now, setNow] = useState(() => new Date());
    const isActive = Boolean(activeWorkStartedAt);
    const action = isActive ? pauseTicketWork : startTicketWork;
    const totalSeconds = useMemo(
        () => getTotalWorkSeconds(workTimeSeconds, activeWorkStartedAt, now),
        [activeWorkStartedAt, now, workTimeSeconds],
    );

    useEffect(() => {
        if (!isActive) {
            return;
        }

        const interval = window.setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => window.clearInterval(interval);
    }, [isActive]);

    return (
        <div className={compact ? "mt-3 flex items-center justify-between gap-3" : "flex flex-col items-start gap-2"}>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tempo trabalhado</p>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    {formatWorkDuration(totalSeconds)}
                    {isActive && <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">rodando</span>}
                </p>
            </div>
            <form action={action}>
                <input type="hidden" name="ticketId" value={ticketId} />
                <TimerButton isActive={isActive} />
            </form>
        </div>
    );
}
