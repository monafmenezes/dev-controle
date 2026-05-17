export default interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: string;
    workTimeSeconds: number | null;
    activeWorkStartedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    customerId: string | null;
    userId: string | null;
    customer: {
        name: string;
    } | null;
}
