import { FiTrash2 } from "react-icons/fi"
import Ticket from "../../interface"
import { deleteTicket } from "../../actions"
import { EditTicketModal } from "./edit-modal"

interface TicketItemProps { 
    ticket: Ticket
}

export function TicketItem({ ticket }: TicketItemProps) {
    return (<>
        <tr className='h-16 border-b border-slate-200 bg-white transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80'>
            <td className='text-left pl-4 text-sm font-medium text-slate-800 dark:text-slate-100'>{ticket.subject || 'Título não especificado'}</td>
            <td className='text-left pl-4 text-sm font-medium text-slate-800 dark:text-slate-100'>{ticket.customer?.name || 'Cliente não especificado'}</td>
            <td className='text-left pl-4 text-sm text-slate-500 hidden sm:table-cell dark:text-slate-400'>{ticket.createdAt?.toLocaleDateString() || 'Data não especificada'}</td>
            <td className='text-left pl-4'><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{ticket.status}</span></td>
            <td className='text-left pl-4'>
                <form action={deleteTicket} className="inline">
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <button type="submit" aria-label={`Remover chamado ${ticket.subject}`} className="mr-2 inline-flex size-9 items-center justify-center rounded-md text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                        <FiTrash2 size={18} />
                    </button>
                </form>
                <EditTicketModal ticket={{
                    id: ticket.id,
                    subject: ticket.subject,
                    description: ticket.description,
                    status: ticket.status,
                }} />
            </td>
        </tr>
    </>)
}

export default TicketItem
