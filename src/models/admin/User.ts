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
    userId: number; 
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
    userId: string; // 삐약! 사용자 id
    festivalId: number; // 삐약! 페스티벌 id
    name: string; // 삐약! 예매자 이름
    maxPurchase: number; // 삐약! 예매한 티켓 수량
    deliveryMethod: string; // 삐약! 수령 방법
    address: string; // 삐약! 주소
    festivalDate: string; // 삐약! 페스티벌 날짜
    phone: string; // 삐약! 전화번호
    reservationNumber: string; // 삐약! 예매번호
}
