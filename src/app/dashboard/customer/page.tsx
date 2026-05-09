import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CardCustomer } from "./components/card";
import prismaClient from "@/lib/prisma";
import { FiPlus, FiUsers } from "react-icons/fi";

export default async function Customer() {
    const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        redirect('/');
      }

      const customers = await prismaClient.customer.findMany({
        where: {
            userId: session.user.id,
        }
      })

    return (
        <Container>
           <main className="mb-10 mt-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">Relacionamento</span>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Meus clientes</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Consulte contatos, acompanhe dados essenciais e mantenha sua carteira em dia.</p>
                    </div>
                    <Link href="/dashboard/customer/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                        <FiPlus size={18} />
                        Novo cliente
                    </Link>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                    {customers.map(customer => (
                        <CardCustomer key={customer.id} customer={customer} />
                    ))}
                </section>

                {customers.length === 0 && (
                    <div className="mt-10 flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                            <FiUsers size={22} />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Nenhum cliente cadastrado</h2>
                        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">Cadastre seu primeiro cliente para vincular chamados e organizar seus atendimentos.</p>
                    </div>
                )}
           </main>
        </Container>
    )
}
