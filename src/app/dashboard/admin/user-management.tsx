"use client";

import { useFormStatus } from "react-dom";
import { FiShield, FiUserCheck, FiUserPlus } from "react-icons/fi";
import { createAdminUser, updateUserRole } from "./actions";

type UserRoleValue = "USER" | "ADMIN";

export type AdminUser = {
    id: string;
    name: string | null;
    email: string | null;
    role: UserRoleValue | null;
    createdAtLabel: string;
};

interface UserManagementProps {
    users: AdminUser[];
    currentUserId: string;
}

function SubmitButton({ children, pendingLabel }: { children: React.ReactNode; pendingLabel: string }) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
        >
            {pending ? pendingLabel : children}
        </button>
    );
}

export function UserManagement({ users, currentUserId }: UserManagementProps) {
    const totalAdmins = users.filter((user) => user.role === "ADMIN").length;
    const totalUsers = users.length;

    return (
        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]" aria-label="Gerenciamento de usuários">
            <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Cadastrar admin</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Crie um usuário admin por email ou promova um usuário existente.
                        </p>
                    </div>
                    <span className="inline-flex size-10 items-center justify-center rounded-md bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                        <FiUserPlus size={20} />
                    </span>
                </div>

                <form action={createAdminUser} className="mt-5 space-y-4">
                    <div>
                        <label htmlFor="admin-name" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Nome
                        </label>
                        <input
                            id="admin-name"
                            name="name"
                            type="text"
                            placeholder="Nome do usuário"
                            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Email
                        </label>
                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            placeholder="admin@empresa.com"
                            required
                            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-sky-400"
                        />
                    </div>
                    <SubmitButton pendingLabel="Salvando...">
                        <FiShield size={16} />
                        Salvar admin
                    </SubmitButton>
                </form>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Usuários</p>
                        <strong className="mt-1 block text-2xl font-bold text-slate-950 dark:text-white">{totalUsers}</strong>
                    </div>
                    <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Admins</p>
                        <strong className="mt-1 block text-2xl font-bold text-slate-950 dark:text-white">{totalAdmins}</strong>
                    </div>
                </div>
            </article>

            <article className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Usuários cadastrados</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Altere a regra de acesso sem sair do painel.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 dark:bg-slate-950/60">
                            <tr className="h-11 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                <th className="pl-5 text-left font-semibold">Usuário</th>
                                <th className="px-4 text-left font-semibold">Regra</th>
                                <th className="px-4 text-left font-semibold">Cadastro</th>
                                <th className="px-5 text-right font-semibold">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const isCurrentUser = user.id === currentUserId;
                                const currentRole = user.role || "USER";
                                const nextRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
                                const cannotDemoteSelf = isCurrentUser && currentRole === "ADMIN";

                                return (
                                    <tr key={user.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                                        <td className="py-3 pl-5 pr-4">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex size-9 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                                    {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{user.name || "Sem nome"}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email || "Sem email"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${currentRole === "ADMIN" ? "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                                                {currentRole === "ADMIN" && <FiUserCheck size={14} />}
                                                {currentRole}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{user.createdAtLabel}</td>
                                        <td className="px-5 py-3 text-right">
                                            <form action={updateUserRole}>
                                                <input type="hidden" name="userId" value={user.id} />
                                                <input type="hidden" name="role" value={nextRole} />
                                                <button
                                                    type="submit"
                                                    disabled={cannotDemoteSelf}
                                                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                                                >
                                                    {currentRole === "ADMIN" ? "Tornar usuário" : "Tornar admin"}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </article>
        </section>
    );
}
