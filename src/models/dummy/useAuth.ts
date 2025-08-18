import { USERROLE, type UserRole} from '@/models/User';

// 삐약! 가상의 로그인 유저 정보를 반환하는 훅입니다!
export const useAuth = () => {
    const user = { 
        id: 123,
        role: USERROLE.ADMIN as UserRole,
        loginId: 'jhy0123',
        name: '정혜영',
        email: 'jhy030123@naver.com',
    } as const;

    // const user = {
    //     userId: 1234,
    //     role: USERROLE.HOST as UserRole,
    //     loginId: 101,
    //     name: '김철수',
    //     email: 'host1@test.com',
    // } as const;

    return user;
};