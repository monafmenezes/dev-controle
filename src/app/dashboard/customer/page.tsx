import { Container } from "@/components/container";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CardCustomer } from "./components/card";

export default async function Customer() {
    const session = await getServerSession(authOptions);

      if (!session || !session.user) {
        redirect('/');
      }

    return (
        <Container>
           <main className="mt-9 mb-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Meus clientes</h1>
                    <Link href="/dashboard/customer/new" className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded">Novo cliente</Link>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <CardCustomer />
                  <CardCustomer />
                  <CardCustomer />
                </section>
           </main>
        </Container>
    )
}