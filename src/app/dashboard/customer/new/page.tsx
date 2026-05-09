import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NewCustomerForm } from "../components/form";
import { FiArrowLeft } from "react-icons/fi";

export default async function NewCustomer() {
    const session = await getServerSession(authOptions);
          
          if (!session || !session.user) {
            redirect('/');
          }

    return (
        <Container>
            <main className="flex flex-col mb-10 mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Novo cadastro</span>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Novo cliente</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Preencha os dados principais para criar um cliente e começar a registrar atendimentos.</p>
                    </div>
                    <Link href="/dashboard/customer" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white">
                        <FiArrowLeft size={18} />
                        Voltar
                    </Link>
                </div>

                <NewCustomerForm userId={session.user.id} />
            </main>
        </Container>
    )       
}
