import { Container } from "@/components/container";
import Link from "next/link";

export function DashboardHeader() {
    return(
        <Container>
            <header className="my-5 flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                <Link href="/dashboard" className="rounded px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">Chamados</Link>
                <Link href="/dashboard/customer" className="rounded px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">Clientes</Link>
            </header>
        </Container>
    )
}
