"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { UserRole } from "../../../../generated/prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
const userIdSchema = z.string().min(1);
const roleSchema = z.enum([UserRole.USER, UserRole.ADMIN]);

async function requireAdmin() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    if (session.user.role !== UserRole.ADMIN) {
        throw new Error("Forbidden");
    }

    return session;
}

export async function createAdminUser(formData: FormData) {
    await requireAdmin();

    const email = emailSchema.parse(formData.get("email")?.toString());
    const name = formData.get("name")?.toString().trim() || null;
    const existingUser = await prisma.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
    });

    if (existingUser) {
        await prisma.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                role: UserRole.ADMIN,
                ...(name ? { name } : {}),
            },
        });
    } else {
        await prisma.user.create({
            data: {
                name,
                email,
                role: UserRole.ADMIN,
            },
        });
    }

    revalidatePath("/dashboard/admin");
}

export async function updateUserRole(formData: FormData) {
    const session = await requireAdmin();
    const userId = userIdSchema.parse(formData.get("userId")?.toString());
    const role = roleSchema.parse(formData.get("role")?.toString());

    if (userId === session.user.id && role !== UserRole.ADMIN) {
        throw new Error("Cannot remove your own admin role");
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            role,
        },
    });

    revalidatePath("/dashboard/admin");
}
