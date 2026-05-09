"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/input"
import { api } from "@/lib/api"
import { useRouter } from "next/navigation"

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
    const {register, handleSubmit, formState: { errors }} = useForm<FormData>({
        resolver: zodResolver(schema)
    })
    
    const router = useRouter();

    async function handleRegister(data: FormData) {
       await api.post('/api/customer', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        userId: userId,
       })
       
       router.replace('/dashboard/customer')
    }

    return (
        <form className="flex flex-col mt-6 gap-2 bg-gray-100 border-gray-300 border p-4 rounded-lg" onSubmit={handleSubmit(handleRegister)}>
            <label className="mb-1 font-medium text-lg">Nome completo</label>
            <Input 
                type="text" 
                placeholder="Digite o nome do cliente.." 
                name="name" 
                register={register} 
                error={errors.name?.message} 
            />
            <section className="flex gap-2 flex-col sm:flex-row">
                <div className="flex-1">
                    <label className="mb-1 font-medium text-lg">Email</label>
                    <Input 
                        type="email" 
                        placeholder="Digite o email do cliente.." 
                        name="email" 
                        register={register} 
                        error={errors.email?.message} 
                    />
                </div>
                <div className="flex-1">
                    <label className="mb-1 font-medium text-lg">Telefone</label>
                    <Input 
                        type="text" 
                        placeholder="Digite o telefone do cliente.." 
                        name="phone" 
                        register={register} 
                        error={errors.phone?.message} 
                    />
                </div>
            </section>

            <label className="mb-1 font-medium text-lg">Endereço</label>
            <Input 
                type="text" 
                placeholder="Digite o endereço  " 
                name="address" 
                register={register} 
                error={errors.address?.message} 
            />

            <button type="submit" className="bg-blue-500 h-11 font-bold my-4 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                Salvar
            </button>
        </form>
    )
}