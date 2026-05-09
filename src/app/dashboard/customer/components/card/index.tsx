"use client";

import { CustomerProps } from "@/utils/customer.type";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiMail, FiMapPin, FiPhone, FiTrash2 } from "react-icons/fi";

export function CardCustomer({ customer }: { customer: CustomerProps }) {
    const router = useRouter();

    async function handleDeleteCustomer() {
     try {
        await api.delete(`api/customer?id=${customer.id}`)
        toast.success("Cliente removido com sucesso!")
        router.refresh();
     } catch (error) {
         toast.error("Não foi possível remover o cliente.")
         console.error(error)
     }
    }

    return (
        <article className="flex min-h-56 flex-col rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500/40">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold leading-tight text-slate-950 dark:text-white">{customer.name}</h2>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Cliente</p>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                    <FiMail className="shrink-0 text-sky-600 dark:text-sky-400" size={16} />
                    <span className="truncate">{customer.email}</span>
                </p>
                <p className="flex items-center gap-2">
                    <FiPhone className="shrink-0 text-emerald-600 dark:text-emerald-400" size={16} />
                    <span>{customer.phone}</span>
                </p>
                <p className="flex items-start gap-2">
                    <FiMapPin className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" size={16} />
                    <span className="line-clamp-2">{customer.address || "Endereço não informado"}</span>
                </p>
            </div>
            <button 
            className="mt-5 inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/15"
            onClick={handleDeleteCustomer}
            >
                <FiTrash2 size={16} />
                Deletar
            </button>
        </article>
    )
}
