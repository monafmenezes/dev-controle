"use client";

import { useEffect, useState, useTransition } from "react";
import { FiEdit2, FiX } from "react-icons/fi";
import { updateTicket } from "../../actions";
import { ticketStatusOptions } from "../../ticket-status";

interface EditTicketModalProps {
    ticket: {
        id: string;
        subject: string;
        description: string;
        status: string;
    };
}

export function EditTicketModal({ ticket }: EditTicketModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const hasMappedStatus = ticketStatusOptions.some((option) => option.value === ticket.status);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    function handleSubmit(formData: FormData) {
        startTransition(async () => {
            await updateTicket(formData);
            setIsOpen(false);
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={`Editar chamado ${ticket.subject}`}
                className="inline-flex size-9 items-center justify-center rounded-md text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-500/10"
            >
                <FiEdit2 size={18} />
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-ticket-title"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div className="w-full max-w-2xl rounded-md border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                            <div>
                                <h2 id="edit-ticket-title" className="text-lg font-semibold text-slate-950 dark:text-white">
                                    Editar chamado
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Atualize as informações e o andamento do atendimento.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Fechar modal"
                                className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                <FiX size={18} />
                            </button>
                        </div>

                        <form action={handleSubmit} className="px-5 py-5">
                            <input type="hidden" name="ticketId" value={ticket.id} />

                            <label htmlFor={`ticket-subject-${ticket.id}`} className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Título
                            </label>
                            <input
                                id={`ticket-subject-${ticket.id}`}
                                name="subject"
                                defaultValue={ticket.subject}
                                className="mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500"
                                required
                            />

                            <label htmlFor={`ticket-description-${ticket.id}`} className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Descrição
                            </label>
                            <textarea
                                id={`ticket-description-${ticket.id}`}
                                name="description"
                                defaultValue={ticket.description}
                                className="mb-4 min-h-32 w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500"
                                required
                            />

                            <label htmlFor={`ticket-status-${ticket.id}`} className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Status
                            </label>
                            <select
                                id={`ticket-status-${ticket.id}`}
                                name="status"
                                defaultValue={ticket.status}
                                className="mb-6 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                required
                            >
                                {!hasMappedStatus && (
                                    <option value={ticket.status}>
                                        Status atual: {ticket.status}
                                    </option>
                                )}
                                {ticketStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
                                >
                                    {isPending ? "Salvando..." : "Salvar alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
