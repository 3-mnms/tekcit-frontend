import { USERROLE, type User } from '@/models/admin/host/User';

export const MOCK_USERS: User[] = [
    {
        id: 1, loginId: 'kimcs', name: '김철수', phone: '010-1111-2222', email: 'kimcs@test.com',
        loginPw: 'password123', role: USERROLE.USER,
        userProfile: {age: 30, residentNum: '940101-1******', birth: '1994.01.01', gender: 'male', 
        address: [{ address: '서울시 강남구 역삼동', is_primary: true }, { address: '경기도 성남시 분당구', is_primary: false }],
        isActive: true}
    },
    {
        id: 2, loginId: 'leeyh', name: '이영희', phone: '010-3333-4444', email: 'leeyh@test.com', 
        loginPw: 'password123',  role: USERROLE.USER,
        userProfile: {age: 25, residentNum: '990505-2******', birth: '1999.05.05', gender: 'female', 
        address: [{ address: '부산시 해운대구', is_primary: true }],
        isActive: true}
    },
    {
        id: 3, loginId: 'parkmj', name: '박민지', phone: '010-5555-6666', email: 'parkmj@test.com',
        loginPw: 'password123', role: USERROLE.USER,
        userProfile: {age: 28, residentNum: '960303-2******', birth: '1996.03.03', gender: 'female', 
        address: [{ address: '대구시 중구', is_primary: false }, { address: '서울시 서초구', is_primary: true }],
        isActive: true}
    },
];
