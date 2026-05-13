"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
