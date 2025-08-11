import type { ProductType } from '@/models/festival';
import { dummyProducts } from '@/models/dummy/dummyProducts';
import type { TicketHolderType } from '@/models/User';
// import axios from 'axios';

// 삐약! 1초의 딜레이를 추가해서 로딩 상태를 테스트해볼 수 있어요!
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProducts = async (hostId?: number): Promise<ProductType[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 삐약! 만약 hostId가 존재하면 해당 호스트의 상품만 필터링해서 반환합니다!
    if (hostId) {
        return dummyProducts.filter(product => product.hostId === hostId);
    }
    
    // 삐약! hostId가 없으면 (admin 역할) 모든 상품을 반환합니다!
    return dummyProducts;
};

export const createProduct = async (newProduct: ProductType): Promise<ProductType> => {
    // 삐약! 백엔드에 요청을 보내는 대신, 임시로 1초를 기다립니다!
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('삐약! 새로운 상품이 등록되었습니다:', newProduct);

    // 삐약! 실제 API는 백엔드에서 ID를 생성해주지만, 지금은 임시로 부여합니다!
    const newId = Date.now();
    const productWithId = { ...newProduct, id: newId };
    
    // 삐약! 새로운 상품을 더미 데이터 목록에 추가합니다 (실제로는 이렇게 하지 않아요!)
    dummyProducts.push(productWithId);

    return productWithId;
};

// 삐약! 상품을 수정하는 mock API 함수를 추가합니다!
export const updateProduct = async (updatedProduct: ProductType): Promise<ProductType> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('삐약! 상품이 수정되었습니다:', updatedProduct);
    
    // 삐약! 실제 API에서는 서버에서 데이터를 업데이트합니다.
    // 지금은 임시로 더미 데이터에서 찾아서 업데이트하는 로직을 추가합니다.
    const productIndex = dummyProducts.findIndex(p => p.id === updatedProduct.id);
    if (productIndex !== -1) {
        dummyProducts[productIndex] = updatedProduct;
    }

    return updatedProduct;
};

export const getProductDetail = async (productId: number): Promise<ProductType | undefined> => {
    await sleep(500); // 삐약! 0.5초 대기!
    const product = dummyProducts.find(p => p.id === productId);
    return product;
};

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

export const deleteProduct = async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`삐약! ${id}번 상품이 삭제되었습니다.`);
    
    // 삐약! 임시로 더미 데이터에서 해당 상품을 삭제합니다!
    const index = dummyProducts.findIndex(p => p.id === id);
    if (index > -1) {
        dummyProducts.splice(index, 1);
    }
};