export const USERROLE = {
    ADMIN: 'admin',
    HOST: 'host',
    USER: 'user'
} as const;

export type UserRole = typeof USERROLE[keyof typeof USERROLE];
export interface Address {
    address: string;
    is_primary: boolean; 
}

export interface BaseUser {
    id: number;
    loginId: string;
    loginPw: string;
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    userProfile?: UserProfile;
    hostProfile?: HostProfile;
}

export type User =
    | (BaseUser & { role: typeof USERROLE.HOST; hostProfile: HostProfile; userProfile?: undefined })
    | (BaseUser & { role: typeof USERROLE.USER; userProfile: UserProfile; hostProfile?: undefined })
    | (BaseUser & { role: typeof USERROLE.ADMIN; hostProfile?: undefined; userProfile?: undefined });

export interface UserProfile{
    age: number;
    residentNum: string; // 주민번호
    birth: string;  
    gender: 'male' | 'female';
    address: Address[];
    isActive: boolean; 
}

export interface HostProfile{
    genre: Genre;
    businessName: string;
    isActive: boolean; 
}

export type Genre = '뮤지컬' | '대중음악' | '연극' | '한국음악' | '서양음악';

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
