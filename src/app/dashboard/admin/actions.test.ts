import { beforeEach, describe, expect, test, vi } from "vitest";
import { UserRole } from "../../../../generated/prisma/client";

const mocks = vi.hoisted(() => ({
    getServerSession: vi.fn(),
    revalidatePath: vi.fn(),
    userCreate: vi.fn(),
    userFindUnique: vi.fn(),
    userUpdate: vi.fn(),
}));

vi.mock("next-auth", () => ({
    getServerSession: mocks.getServerSession,
}));

vi.mock("next/cache", () => ({
    revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth", () => ({
    authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            create: mocks.userCreate,
            findUnique: mocks.userFindUnique,
            update: mocks.userUpdate,
        },
    },
}));

function formData(values: Record<string, string>) {
    const data = new FormData();

    Object.entries(values).forEach(([key, value]) => {
        data.set(key, value);
    });

    return data;
}

describe("admin user actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getServerSession.mockResolvedValue({
            user: {
                id: "admin-id",
                role: UserRole.ADMIN,
            },
        });
    });

    test("creates a new admin user", async () => {
        mocks.userFindUnique.mockResolvedValueOnce(null);

        const { createAdminUser } = await import("./actions");

        await createAdminUser(formData({ name: "Ana Admin", email: " ANA@EXAMPLE.COM " }));

        expect(mocks.userCreate).toHaveBeenCalledWith({
            data: {
                name: "Ana Admin",
                email: "ana@example.com",
                role: UserRole.ADMIN,
            },
        });
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });

    test("promotes an existing user when the email is already registered", async () => {
        mocks.userFindUnique.mockResolvedValueOnce({ id: "user-id" });

        const { createAdminUser } = await import("./actions");

        await createAdminUser(formData({ email: "user@example.com" }));

        expect(mocks.userCreate).not.toHaveBeenCalled();
        expect(mocks.userUpdate).toHaveBeenCalledWith({
            where: {
                id: "user-id",
            },
            data: {
                role: UserRole.ADMIN,
            },
        });
    });

    test("does not allow non-admin users to create admins", async () => {
        mocks.getServerSession.mockResolvedValueOnce({
            user: {
                id: "user-id",
                role: UserRole.USER,
            },
        });

        const { createAdminUser } = await import("./actions");

        await expect(createAdminUser(formData({ email: "admin@example.com" }))).rejects.toThrow("Forbidden");
        expect(mocks.userCreate).not.toHaveBeenCalled();
        expect(mocks.userUpdate).not.toHaveBeenCalled();
    });

    test("updates another user's role", async () => {
        const { updateUserRole } = await import("./actions");

        await updateUserRole(formData({ userId: "user-id", role: UserRole.ADMIN }));

        expect(mocks.userUpdate).toHaveBeenCalledWith({
            where: {
                id: "user-id",
            },
            data: {
                role: UserRole.ADMIN,
            },
        });
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/admin");
    });

    test("prevents an admin from removing their own admin role", async () => {
        const { updateUserRole } = await import("./actions");

        await expect(updateUserRole(formData({ userId: "admin-id", role: UserRole.USER }))).rejects.toThrow(
            "Cannot remove your own admin role",
        );
        expect(mocks.userUpdate).not.toHaveBeenCalled();
    });
});
