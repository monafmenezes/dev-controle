export function CardCustomer() {
    return (
        <article className="flex flex-col bg-gray-100 border-gray-300 border p-2 rounded-lg gap-2 hover:scale-105 duration-300">
            <h2>
                <span className="font-bold">Nome: </span>Mercado Silva
            </h2>
            <p>
                <span className="font-bold">Email: </span>mercado.silva@example.com
            </p>
            <p>
                <span className="font-bold">Telefone: </span>(11) 98765-4321
            </p>

            <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded cursor-pointer self-start">Deletar</button>
        </article>
    )
}