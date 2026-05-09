"use client"
import { RegisterOptions, UseFormRegister } from "react-hook-form";

interface InputProps {
    type: string;
    placeholder: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: UseFormRegister<any>;
    error?: string;
    rules?: RegisterOptions;
}

export function Input({ type, placeholder, name, register, error, rules }: InputProps) {
    return (
        <>
        <input
            className="w-full rounded-md border-2 border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            type={type}
            placeholder={placeholder}
            {...register(name, rules)}
            id={name}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </>
    );
}