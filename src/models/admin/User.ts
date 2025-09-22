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
    loginId: string | null;
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
    userId: string; //사용자 id
    festivalId: number; // 페스티벌 id
    name: string; //  예매자 이름
    maxPurchase: number; // 예매한 티켓 수량
    deliveryMethod: string; // 수령 방법
    address: string; // 주소
    festivalDate: string; //  페스티벌 날짜
    phone: string; // 전화번호
    reservationNumber: string; // 예매번호
}
