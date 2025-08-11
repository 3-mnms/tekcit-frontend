import { UserRole } from '@/models/festival';

// 삐약! 가상의 로그인 유저 정보를 반환하는 훅입니다!
export const useAuth = () => {
    const user = { 
        role: UserRole.ADMIN as UserRole, 
        hostId: 123,
        userName: '정혜영',
        userEmail: 'jhy030123@naver.com',
    } as const;

    // const user = {
    //     role: UserRole.HOST as UserRole,
    //     hostId: 101,
    //     userName: '김철수',
    //     userEmail: 'host1@test.com',
    // } as const;

    return user;
};