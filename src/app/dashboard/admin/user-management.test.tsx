import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { UserManagement } from "./user-management";

vi.mock("./actions", () => ({
    createAdminUser: vi.fn(),
    updateUserRole: vi.fn(),
}));

const users = [
    {
        id: "admin-id",
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN" as const,
        createdAtLabel: "14/05/2026",
    },
    {
        id: "user-id",
        name: "Regular User",
        email: "user@example.com",
        role: "USER" as const,
        createdAtLabel: "13/05/2026",
    },
];

describe("UserManagement", () => {
    afterEach(() => {
        cleanup();
    });

    test("renders the admin creation form and user totals", () => {
        render(<UserManagement users={users} currentUserId="admin-id" />);

        expect(screen.getByRole("heading", { name: /cadastrar admin/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeRequired();
        expect(screen.getByRole("button", { name: /salvar admin/i })).toBeInTheDocument();
        expect(screen.getByText("Usuários")).toBeInTheDocument();
        expect(screen.getByText("Admins")).toBeInTheDocument();
        expect(screen.getAllByText("2")).toHaveLength(1);
        expect(screen.getAllByText("1")).toHaveLength(1);
    });

    test("lists users and prevents the current admin from demoting themselves", () => {
        render(<UserManagement users={users} currentUserId="admin-id" />);

        const adminRow = screen.getByText("admin@example.com").closest("tr");
        const regularRow = screen.getByText("user@example.com").closest("tr");

        expect(adminRow).not.toBeNull();
        expect(regularRow).not.toBeNull();
        expect(within(adminRow as HTMLTableRowElement).getByRole("button", { name: /tornar usuário/i })).toBeDisabled();
        expect(within(regularRow as HTMLTableRowElement).getByRole("button", { name: /tornar admin/i })).toBeEnabled();
    });
});
