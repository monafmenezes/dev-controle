import { FiFile, FiTrash2 } from "react-icons/fi"

export function TicketItem() {
    return (<>
        <tr className='border-b-2 border-b-slate-200 h-16 last:border-b-0 bg-slate-100 hover:bg-gray-200 duration-300'>
            <td className='text-left pl-2'>Cliente 1</td>
            <td className='text-left pl-2 hidden sm:table-cell'>01/01/2024</td>
            <td className='text-left pl-2'><span className="bg-green-500 px-2 py-1 rounded">Aberto</span></td>
            <td className='text-left pl-2'>
                <button className="mr-2">
                    <FiTrash2 size={24} color="#EF4444" />
                </button>
                <button>
                    <FiFile size={24} color="#3b82f6" />
                </button>
            </td>
        </tr>
    </>)
}

export default TicketItem