"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ticketStatusOptions } from "./ticket-status";

const allowedTicketStatuses = new Set<string>(ticketStatusOptions.map((status) => status.value));

export async function deleteTicket(formData: FormData) {
    const session = await getServerSession(authOptions);
    const ticketId = formData.get("ticketId")?.toString();

    if (!session?.user?.id || !ticketId) {
        return;
    }

    await prisma.ticket.deleteMany({
        where: {
            id: ticketId,
            userId: session.user.id,
        },
    });

    revalidatePath("/dashboard");
}

export async function updateTicketStatus(formData: FormData) {
    const session = await getServerSession(authOptions);
    const ticketId = formData.get("ticketId")?.toString();
    const status = formData.get("status")?.toString();

    if (!session?.user?.id || !ticketId || !status || !allowedTicketStatuses.has(status)) {
        return;
    }

    await prisma.ticket.updateMany({
        where: {
            id: ticketId,
            userId: session.user.id,
        },
        data: {
            status,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/followup");
    revalidatePath("/dashboard/metrics");
}

export async function startTicketWork(formData: FormData) {
    const session = await getServerSession(authOptions);
    const ticketId = formData.get("ticketId")?.toString();

    if (!session?.user?.id || !ticketId) {
        return;
    }

    const ticket = await prisma.ticket.findFirst({
        where: {
            id: ticketId,
            userId: session.user.id,
        },
        select: {
            activeWorkStartedAt: true,
        },
    });

    if (!ticket || ticket.activeWorkStartedAt) {
        return;
    }

    await prisma.ticket.updateMany({
        where: {
            id: ticketId,
            userId: session.user.id,
        },
        data: {
            activeWorkStartedAt: new Date(),
            status: "EM_ANDAMENTO",
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/followup");
    revalidatePath("/dashboard/metrics");
}

export async function pauseTicketWork(formData: FormData) {
    const session = await getServerSession(authOptions);
    const ticketId = formData.get("ticketId")?.toString();

    if (!session?.user?.id || !ticketId) {
        return;
    }

    const ticket = await prisma.ticket.findFirst({
        where: {
            id: ticketId,
            userId: session.user.id,
        },
        select: {
            activeWorkStartedAt: true,
            workTimeSeconds: true,
        },
    });

    if (!ticket?.activeWorkStartedAt) {
        return;
    }

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - ticket.activeWorkStartedAt.getTime()) / 1000));

    await prisma.ticket.updateMany({
        where: {
            id: ticketId,
            userId: session.user.id,
        },
        data: {
            activeWorkStartedAt: null,
            workTimeSeconds: (ticket.workTimeSeconds || 0) + elapsedSeconds,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/followup");
    revalidatePath("/dashboard/metrics");
}

export async function updateTicket(formData: FormData) {
    const session = await getServerSession(authOptions);
    const ticketId = formData.get("ticketId")?.toString();
    const subject = formData.get("subject")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const status = formData.get("status")?.toString();

    if (!session?.user?.id || !ticketId || !subject || !description || !status) {
        return;
    }

    await prisma.ticket.updateMany({
        where: {
            id: ticketId,
            userId: session.user.id,
        },
        data: {
            subject,
            description,
            status,
        },
    });

    revalidatePath("/dashboard");
}
