export const ticketStatusOptions = [
    {
        value: "ABERTO",
        label: "Aberto",
        description: "Novas solicitações aguardando triagem.",
        badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    },
    {
        value: "EM_ANDAMENTO",
        label: "Em andamento",
        description: "Chamados que já estão em atendimento.",
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    },
    {
        value: "RESOLVIDO",
        label: "Resolvido",
        description: "Soluções aplicadas aguardando validação.",
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
        value: "FECHADO",
        label: "Fechado",
        description: "Atendimentos concluídos e arquivados.",
        badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    },
] as const;

export type TicketStatus = (typeof ticketStatusOptions)[number]["value"];

export function normalizeTicketStatus(status: string) {
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === "OPEN") {
        return "ABERTO";
    }

    return normalizedStatus;
}

export function getTicketStatusOption(status: string) {
    const normalizedStatus = normalizeTicketStatus(status);

    return ticketStatusOptions.find((option) => option.value === normalizedStatus);
}

export function formatTicketStatus(status: string) {
    const option = getTicketStatusOption(status);

    if (option) {
        return option.label;
    }

    return normalizeTicketStatus(status)
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function getTicketStatusBadgeClass(status: string) {
    return getTicketStatusOption(status)?.badgeClass || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

export function formatElapsedTime(startDate: Date, endDate = new Date()) {
    const diffInMinutes = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60)));

    if (diffInMinutes < 1) {
        return "agora";
    }

    if (diffInMinutes < 60) {
        return `${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInHours < 24) {
        return `${diffInHours} h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);

    return `${diffInDays} dia${diffInDays === 1 ? "" : "s"}`;
}

export function getTotalWorkSeconds(workTimeSeconds: number | null | undefined, activeWorkStartedAt?: Date | null, endDate = new Date()) {
    const accumulatedSeconds = workTimeSeconds || 0;

    if (!activeWorkStartedAt) {
        return accumulatedSeconds;
    }

    return accumulatedSeconds + Math.max(0, Math.floor((endDate.getTime() - activeWorkStartedAt.getTime()) / 1000));
}

export function formatWorkDuration(totalSeconds: number) {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
    }

    if (minutes > 0) {
        return `${minutes} min`;
    }

    return "menos de 1 min";
}
