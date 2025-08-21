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
    
    const response = await api.post<Festival>('/festival/manage', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;

};

/**
 * 공연 수정 (put /api/festival/manage/{fid})
 * @param fid 수정할 공연의 ID
 * @param formData 수정할 내용이 담긴 FormData (JSON + 파일)
 */
export const updateProduct = async (fid: string, formData: FormData): Promise<Festival> => {
    const response = await api.put<Festival>(`/festival/manage/${fid}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
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
 * 공연 상세 정보 조회 (GET /api/festival/{fid})
 * @param fid 조회할 공연의 ID
 */
export const getProductDetail = async (fid: string): Promise<Festival> => {
    console.log(`삐약! ${fid}번 공연 상세 정보를 서버에 요청해요!`);
    const response = await api.get<Festival>(`/festival/manage/${fid}`);
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
