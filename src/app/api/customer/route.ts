import { NextResponse } from "next/server";
import {getServerSession} from "next-auth/next"
import { authOptions } from "@/lib/auth";
import prismaClient from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { name, email, phone, address, userId } = await request.json();

    try {
        await prismaClient.customer.create({
            data: {
                name,
                email,
                phone,
                address: address || '',
                userId,
            }
        });

        return NextResponse.json({ message: "Customer created successfully" }, { status: 201 });
        
    } catch (error) {
        return NextResponse.json({ message: "Error creating customer", error }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json({ message: "Customer ID is required" }, { status: 400 });
    }

    const findTickets = await prismaClient.ticket.findMany({
        where: {
            customerId: id,
        }
    });

    if (findTickets.length > 0) {
        return NextResponse.json({ message: "Cannot delete customer with existing tickets" }, { status: 400 });
    }

    try {
        await prismaClient.customer.delete({
            where: {
                id,
            }
        });

        return NextResponse.json({ message: "Customer deleted successfully" }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ message: "Error deleting customer", error }, { status: 400 });
    }
}
