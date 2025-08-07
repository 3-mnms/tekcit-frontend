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
    resident_num: string; // 낙타화법 residentNum
    birth: string;  // 
    gender: Gender;
    address: Address[]; // addresses
    pw?: string; // loginPw
    isActive: boolean; 
}