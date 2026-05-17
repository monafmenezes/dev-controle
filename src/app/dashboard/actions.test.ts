import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    getServerSession: vi.fn(),
    revalidatePath: vi.fn(),
    ticketFindFirst: vi.fn(),
    ticketUpdateMany: vi.fn(),
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
        ticket: {
            deleteMany: vi.fn(),
            findFirst: mocks.ticketFindFirst,
            updateMany: mocks.ticketUpdateMany,
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

describe("dashboard ticket actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getServerSession.mockResolvedValue({
            user: {
                id: "user-id",
            },
        });
    });

    test("updates ticket status for the signed-in user", async () => {
        const { updateTicketStatus } = await import("./actions");

        await updateTicketStatus(formData({ ticketId: "ticket-id", status: "EM_ANDAMENTO" }));

        expect(mocks.ticketUpdateMany).toHaveBeenCalledWith({
            where: {
                id: "ticket-id",
                userId: "user-id",
            },
            data: {
                status: "EM_ANDAMENTO",
            },
        });
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/followup");
        expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/metrics");
    });

    test("ignores invalid statuses", async () => {
        const { updateTicketStatus } = await import("./actions");

        await updateTicketStatus(formData({ ticketId: "ticket-id", status: "CANCELADO" }));

        expect(mocks.ticketUpdateMany).not.toHaveBeenCalled();
        expect(mocks.revalidatePath).not.toHaveBeenCalled();
    });

    test("does not update tickets without a signed-in user", async () => {
        mocks.getServerSession.mockResolvedValueOnce(null);

        const { updateTicketStatus } = await import("./actions");

        await updateTicketStatus(formData({ ticketId: "ticket-id", status: "RESOLVIDO" }));

        expect(mocks.ticketUpdateMany).not.toHaveBeenCalled();
    });

    test("starts work on a ticket and moves it to in progress", async () => {
        mocks.ticketFindFirst.mockResolvedValueOnce({
            activeWorkStartedAt: null,
        });

        const { startTicketWork } = await import("./actions");

        await startTicketWork(formData({ ticketId: "ticket-id" }));

        expect(mocks.ticketUpdateMany).toHaveBeenCalledWith({
            where: {
                id: "ticket-id",
                userId: "user-id",
            },
            data: {
                activeWorkStartedAt: expect.any(Date),
                status: "EM_ANDAMENTO",
            },
        });
    });

    test("pauses work and accumulates elapsed seconds", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-05-14T12:10:00.000Z"));
        mocks.ticketFindFirst.mockResolvedValueOnce({
            activeWorkStartedAt: new Date("2026-05-14T12:00:00.000Z"),
            workTimeSeconds: 120,
        });

        const { pauseTicketWork } = await import("./actions");

        await pauseTicketWork(formData({ ticketId: "ticket-id" }));

        expect(mocks.ticketUpdateMany).toHaveBeenCalledWith({
            where: {
                id: "ticket-id",
                userId: "user-id",
            },
            data: {
                activeWorkStartedAt: null,
                workTimeSeconds: 720,
            },
        });

        vi.useRealTimers();
    });
});
