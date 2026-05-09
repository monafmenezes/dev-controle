"use client";

import { CustomerProps } from "@/utils/customer.type";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
        <article className="flex flex-col bg-gray-100 border-gray-300 border p-2 rounded-lg gap-2 hover:scale-105 duration-300">
            <h2>
                <span className="font-bold">Nome: </span>{customer.name}
            </h2>
            <p>
                <span className="font-bold">Email: </span>{customer.email}
            </p>
            <p>
                <span className="font-bold">Telefone: </span>{customer.phone}
            </p>
            <p>
                <span className="font-bold">Endereço: </span>{customer.address}
            </p>
            <button 
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded cursor-pointer self-start"
            onClick={handleDeleteCustomer}
            >
                Deletar
            </button>
        </article>
    )
}
