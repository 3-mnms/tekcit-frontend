export interface User {
    id: number;
    name: string;
    userId: string;
    phone: string;
    email: string;
    genre: string;
    businessName: string;
    pw?: string;
    isActive: boolean;
}