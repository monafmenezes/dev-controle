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

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const customers = await prismaClient.customer.findMany({
            where: {
                userId: session.user.id,
            }
        });

        return NextResponse.json(customers, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ message: "Error fetching customers", error }, { status: 400 });
    }
}