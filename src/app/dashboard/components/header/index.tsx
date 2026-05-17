"use client";

import { Container } from "@/components/container";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const tabs = [
    { href: "/dashboard", label: "Chamados", exact: true },
    { href: "/dashboard/followup", label: "Follow-up" },
    { href: "/dashboard/metrics", label: "Métricas" },
    { href: "/dashboard/admin", label: "Admin", adminOnly: true },
    { href: "/dashboard/customer", label: "Clientes" },
];

export function DashboardHeader() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const visibleTabs = tabs.filter((tab) => !tab.adminOnly || session?.user.role === "ADMIN");

    return(
        <Container>
            <header className="my-5 flex w-full flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                {visibleTabs.map((tab) => {
                    const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            aria-current={isActive ? "page" : undefined}
                            className={`rounded px-4 py-2 text-sm font-medium transition ${
                                isActive
                                    ? "bg-slate-950 text-white shadow-sm dark:bg-sky-500 dark:text-slate-950"
                                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </header>
        </Container>
    )
}
