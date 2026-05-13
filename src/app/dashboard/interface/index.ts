export default interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    customerId: string | null;
    userId: string | null;
    customer: {
        name: string;
    } | null;
}
