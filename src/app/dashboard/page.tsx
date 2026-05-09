import { Container } from '@/components/container';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TicketItem } from './components/ticket';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/');
  }

  return (
    <Container>
      <main className='mt-9 mb-2'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Chamados</h1>
          <Link href="/dashboard/new" className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded'>Abrir chamado</Link>
        </div>

        <table className='min-w-full my-2'>
          <thead>
            <tr>
              <th className='text-left font-medium pl-2'>CLIENTE</th>
              <th className='text-left font-medium pl-2 hidden sm:table-cell'>DATA CADASTRO</th>
              <th className='text-left font-medium pl-2'>STATUS</th>
              <th className='text-left font-medium pl-2'>#</th>
            </tr>
          </thead>
          <tbody>
            <TicketItem />
          </tbody>
        </table>
      </main>
    </Container>
  );
}

