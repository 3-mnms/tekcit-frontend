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
    residentNum: string; // 주민번호
    birth: string;  
    gender: Gender;
    address: Address[]; // addresses
    pw?: string; // loginPw
    isActive: boolean; 
}

export interface TicketHolderType {
    id: number; 
    userid: string; // 삐약! 사용자 id
    festival_id: number; // 삐약! 페스티벌 id
    name: string; // 삐약! 예매자 이름
    maxPurchase: number; // 삐약! 예매한 티켓 수량
    delivery_method: string; // 삐약! 수령 방법
    address: string; // 삐약! 주소
    festival_date: string; // 삐약! 페스티벌 날짜
    phone: string; // 삐약! 전화번호
    reservation_number: string; // 삐약! 예매번호
}