"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/input"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const schema = z.object({
    name: z.string().min(2, "O campo nome é obrigatório").max(100),
    email: z.email("O campo email é inválido").min(1, "O campo email é obrigatório"),
    phone: z.string().refine((value) => {
        return /^\(\d{2}\) \d{5}-\d{4}$/.test(value) || /^\(\d{2}\) \d{4}-\d{4}$/.test(value) || /^\d{10,11}$/.test(value);
    }, "O campo telefone deve estar no formato (XX) XXXXX-XXXX")
    .min(1, "O campo telefone é obrigatório"),
    address: z.string(), 
})

type FormData = z.infer<typeof schema>

export function NewCustomerForm({userId}: {userId: string}) {
    const {register, handleSubmit, formState: { errors, isSubmitting }} = useForm<FormData>({
        resolver: zodResolver(schema)
    })
    
    const router = useRouter();

    async function handleRegister(data: FormData) {
       try {
        await api.post('/customer', {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            userId: userId,
        })

        toast.success("Cliente cadastrado com sucesso!")
        router.refresh();
        router.replace('/dashboard/customer')
       } catch {
        toast.error("Não foi possível cadastrar o cliente.")
       }
    }

    return (
        <form className="mt-6 flex max-w-3xl flex-col gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit(handleRegister)}>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nome completo</label>
            <Input 
                type="text" 
                placeholder="Digite o nome do cliente.." 
                name="name" 
                register={register} 
                error={errors.name?.message} 
            />
            <section className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
                    <Input 
                        type="email" 
                        placeholder="Digite o email do cliente.." 
                        name="email" 
                        register={register} 
                        error={errors.email?.message} 
                    />
                </div>
                <div className="flex-1">
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Telefone</label>
                    <Input 
                        type="text" 
                        placeholder="Digite o telefone do cliente.." 
                        name="phone" 
                        register={register} 
                        error={errors.phone?.message} 
                    />
                </div>
            </section>

            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Endereço</label>
            <Input 
                type="text" 
                placeholder="Digite o endereço  " 
                name="address" 
                register={register} 
                error={errors.address?.message} 
            />

            <button type="submit" disabled={isSubmitting} className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
                {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
        </form>
    )
}
