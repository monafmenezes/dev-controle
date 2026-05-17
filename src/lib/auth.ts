import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { AuthOptions } from 'next-auth'
import prismaClient  from './prisma'
import { UserRole } from '../../generated/prisma/client'

export const authOptions: AuthOptions = {

    adapter: PrismaAdapter(prismaClient),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            const persistedUser = await prismaClient.user.findUnique({
                where: {
                    id: user.id,
                },
                select: {
                    role: true,
                },
            });

            session.user = {...session.user, id: user.id, role: persistedUser?.role ?? UserRole.USER } as { 
                id: string,
                name: string,
                email: string,
                role: UserRole,
            }
            
            return session
        },
    },
}


