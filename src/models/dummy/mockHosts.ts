// src/shared/data/mockHosts.ts

import { USERROLE, type User } from '@/models/admin/host/User';

export const MOCK_HOSTS: User[] = [
    {
        id: 1, loginId: 'host1', loginPw: 'password123', name: '김철수', phone: '010-1111-2222', email: 'host1@email.com',
        role: USERROLE.HOST,
        hostProfile: { businessName: '콘서트 기획사', isActive : true }
    },
    {
        id: 2, loginId: 'host2', loginPw: 'password123', name: '이영희', phone: '010-3333-4444', email: 'host2@email.com',
        role: USERROLE.HOST,
        hostProfile: { businessName: '뮤지컬 제작사', isActive : true }
    },
    {
        id: 3, loginId: 'host3', loginPw: 'password123', name: '박민준', phone: '010-5555-6666', email: 'admin1@email.com',
        role: USERROLE.HOST, hostProfile: { businessName: '뮤지컬 제작사', isActive : true }
    },
];