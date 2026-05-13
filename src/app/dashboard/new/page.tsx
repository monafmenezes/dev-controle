import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import prismaClient from "@/lib/prisma";

export default async function NewDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect('/');
    }

    const customers = await prismaClient.customer.findMany({
        where: {
            userId: session.user.id,
        }
    })

    async function handleRegisterTicket(formData: FormData) {
        "use server";
            const subject = formData.get('subject')?.toString();
            const description = formData.get('description')?.toString();
            const customerId = formData.get('customer')?.toString();

            if (!subject || !description || !customerId) {
                return;
            }
            
            await prismaClient.ticket.create({
                data: {
                    subject,
                    description,
                    customerId,
                    status: 'ABERTO',
                    userId: session?.user.id,
                }
            })

        redirect('/dashboard');
    }

    return (
        <Container>
            <div>
                <main className="mb-10 mt-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Novo Chamado</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Preencha os dados para criar um novo chamado e acompanhar seu andamento.</p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                        >
                            Voltar
                        </Link>
                    </div>
                    <form className="mt-8" action={handleRegisterTicket} >
                        <label className="mb-1 font-medium text-lg">Nome do chamado</label>
                        <input name="subject" className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500" placeholder="Ex: Suporte técnico para software X" required />
                        <label className="mb-1 font-medium text-lg">Descreva o problema</label>
                        <textarea required name="description" className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 resize-none" placeholder="Descreva o problema ou solicitação com detalhes para facilitar o atendimento." rows={4} />
                        {customers.length > 0 && (
                            <>
                                <label className="mb-1 font-medium text-lg">Selecione o cliente</label>
                                <select required name="customer" className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                                    <option value="">Selecione um cliente</option>
                                    {customers.map(customer => (
                                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                                    ))}
                                </select>
                            </>
                        )}

                        {customers.length === 0 && (
                            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">Nenhum cliente cadastrado. Cadastre um cliente para vincular ao chamado. <Link href="/dashboard/customer/new" className="text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300">Cadastrar cliente.</Link></p>
                        )}

                        <button type="submit" disabled={customers.length === 0} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-700">
                            Criar chamado
                        </button>
                    </form>
                </main>
            </div>
        </Container>)
}