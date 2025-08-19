import type { Festival } from '@/models/admin/host/festival';
// import { dummyProducts } from '@/models/dummy/dummyProducts';
import type { TicketHolderType } from '@/models/admin/host/User';
import { api } from '@/shared/api/axios';


// 공연 조회
export const getProducts = async (): Promise<Festival[]> => {
    console.log('삐약! 공연 목록을 서버에 요청해요!');
    const response = await api.get<Festival[]>('/festival/manage');
    return response.data;
};

/**
 * 공연 등록 (POST /api/festival/manage)
 * @param formData 폼 데이터 (JSON + 파일들)
 */
export const createProduct = async (formData: FormData): Promise<Festival> => {
    
    // const response = await api.post<Festival>('/festival/manage', formData, {
    //     headers: {
    //         'Content-Type': 'multipart/form-data',
    //     },
    // });
    // return response.data;

    console.log('---  MOCK API: createProduct 호출됨 ---');
    
    // 프론트엔드에서 보낸 FormData 내용물을 확인하는 꿀팁!
    for (const [key, value] of formData.entries()) {
        console.log(`- ${key}:`, value);
    }

    // 1초 딜레이를 줘서 실제 로딩하는 것처럼 보이게 만들자!
    console.log('1초 후 성공 응답을 보냅니다...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // FormData에서 'requestDTO'를 다시 꺼내서 객체로 만드는 척!
    const requestDTO = JSON.parse(formData.get('requestDTO') as string);

    // 성공했다고 가정하고, 서버가 만들어줄 것 같은 가짜 데이터를 반환하자.
    const fakeResponseData: Festival = {
        ...requestDTO,
        fid: `PF${Date.now()}`, // 임시로 고유 ID를 만들어줘.
        detail: {
            ...requestDTO.detail,
            updatedate: new Date().toISOString(), // 현재 시간으로 업데이트 날짜 설정
        }
    };
    
    // 삐약! 일부러 에러 상황을 테스트하고 싶으면 아래 코드의 주석을 풀어봐!
    // return Promise.reject(new Error('삐약! 서버에서 가짜 에러 발생!'));

    console.log('--- MOCK API: 성공 응답 반환 ---', fakeResponseData);
    return Promise.resolve(fakeResponseData);

};

/**
 * 공연 수정 (PATCH /api/festival/manage/{fid})
 * @param fid 수정할 공연의 ID
 * @param formData 수정할 내용이 담긴 FormData (JSON + 파일)
 */
export const updateProduct = async (fid: string, formData: FormData): Promise<Festival> => {
    // const response = await api.patch<Festival>(`/festival/manage/${fid}`, formData, {
    //     headers: {
    //         'Content-Type': 'multipart/form-data',
    //     },
    // });
    // return response.data;

    console.log(`--- MOCK API: updateProduct 호출됨 (ID: ${fid}) ---`);
    for (const [key, value] of formData.entries()) {
        console.log(`- ${key}:`, value);
    }
    
    console.log('1초 후 성공 응답을 보냅니다...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const requestDTO = JSON.parse(formData.get('requestDTO') as string);
    
    // 수정 요청이니까 받은 fid를 그대로 사용하자.
    const fakeResponseData: Festival = { 
        ...requestDTO,
        fid: fid, // 받은 fid를 그대로 사용
    };
    
    console.log('--- MOCK API: 성공 응답 반환 ---', fakeResponseData);
    return Promise.resolve(fakeResponseData);
};

/**
 * 공연 삭제 (DELETE /api/festival/manage/{productId})
 * @param id 삭제할 공연의 ID
 */
export const deleteProduct = async (fid: string): Promise<void> => {
    console.log(`삐약! ${fid}번 공연을 서버에 삭제 요청해요!`);
    await api.delete(`/festival/manage/${fid}`);
};

/**
 * 공연 상세 정보 조회 (GET /api/festival/{id})
 * @param fid 조회할 공연의 ID
 */
export const getProductDetail = async (fid: string): Promise<Festival> => {
    console.log(`삐약! ${fid}번 공연 상세 정보를 서버에 요청해요!`);
    const response = await api.get<Festival>(`/festival/${fid}`);
    return response.data;
};


// 목데이터
const mockAttendees: TicketHolderType[] = [
    { id: 1, userid: 'user123', festival_id: 1, name: '김철수', maxPurchase: 2, delivery_method: 'QR', address: '서울시 강남구', festival_date: '2025-08-20', phone: '010-1234-5678', reservation_number: 'R123456' },
    { id: 2, userid: 'user456', festival_id: 1, name: '이영희', maxPurchase: 1, delivery_method: '티켓', address: '부산시 해운대구', festival_date: '2025-08-21', phone: '010-9876-5432', reservation_number: 'R654321' },
    { id: 3, userid: 'user789', festival_id: 2, name: '박민준', maxPurchase: 3, delivery_method: 'QR', address: '경기도 성남시', festival_date: '2025-09-10', phone: '010-5555-6666', reservation_number: 'R789012' },
];

export const getAttendeesByFestivalId = async (festivalId: number): Promise<TicketHolderType[]> => {
    // ...
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // 삐약! festivalId에 따라 데이터를 필터링하도록 로직을 추가합니다!
    return mockAttendees.filter(attendee => attendee.festival_id === festivalId);
};
