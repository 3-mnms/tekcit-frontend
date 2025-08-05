export interface Address {
    address: string;
    is_primary: boolean; 
}

export type Gender = 'male' | 'female'
// export type Role = 'user' | 'host' | 'admin';

export interface User {
    id: number;
    name: string;
    loginId: string;
    phone: string;
    email: string;
    age: number;
    resident_num: string;
    birth: string;
    gender: Gender;
    address: Address[];
    pw?: string;
    isActive: boolean;
}