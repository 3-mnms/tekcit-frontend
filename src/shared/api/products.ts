import type { ProductType } from '@/models/Product';
import { dummyProducts } from '@/models/dummy/dummyProducts';

// 삐약! 1초의 딜레이를 추가해서 로딩 상태를 테스트해볼 수 있어요!
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProducts = async (searchTerm: string): Promise<ProductType[]> => {
    await sleep(1000); // 삐약! 1초 대기!

    // 삐약! 검색 로직을 적용합니다!
    const filtered = dummyProducts.filter(product =>
        product.fname.includes(searchTerm) ||
        product.genrenm.includes(searchTerm) ||
        product.fcltynm.includes(searchTerm)
    );

    return filtered;
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

export const getProductDetail = async (productId: number): Promise<ProductType | undefined> => {
    await sleep(500); // 삐약! 0.5초 대기!
    const product = dummyProducts.find(p => p.id === productId);
    return product;
};