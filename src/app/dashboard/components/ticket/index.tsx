import { FiFile, FiTrash2 } from "react-icons/fi"

export function TicketItem() {
    return (<>
        <tr className='h-16 border-b border-slate-200 bg-white transition last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80'>
            <td className='text-left pl-4 text-sm font-medium text-slate-800 dark:text-slate-100'>Cliente 1</td>
            <td className='text-left pl-4 text-sm text-slate-500 hidden sm:table-cell dark:text-slate-400'>01/01/2024</td>
            <td className='text-left pl-4'><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Aberto</span></td>
            <td className='text-left pl-4'>
                <button aria-label="Remover chamado" className="mr-2 inline-flex size-9 items-center justify-center rounded-md text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10">
                    <FiTrash2 size={18} />
                </button>
                <button aria-label="Ver chamado" className="inline-flex size-9 items-center justify-center rounded-md text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10">
                    <FiFile size={18} />
                </button>
            </td>
        </tr>
    </>)
}

export default TicketItem
