export const USERROLE = {
    ADMIN: 'ADMIN',
    HOST: 'HOST',
    USER: 'USER'
} as const;

export type UserRole = typeof USERROLE[keyof typeof USERROLE];
export interface Address {
    name: string;
    phone: string;
    address: string;
    zipCode: string;
    default: boolean;
}

export interface BaseUser {
    id: number; 
    loginId: string;
    loginPw?: string;
    name: string;
    phone: string;
    email: string;
    role: UserRole;
}

export type User = (BaseUser & {role: typeof USERROLE.HOST; businessName: string; active: boolean;
}) | (BaseUser & {role: typeof USERROLE.USER; residentNum: string; birth: string; gender: 'MALE' | 'FEMALE';  addresses: Address[];  active: boolean;
}) | (BaseUser & {role: typeof USERROLE.ADMIN;
});

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
