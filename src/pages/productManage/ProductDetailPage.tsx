import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import { getProductDetail } from '@/shared/api/products';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage: React.FC = () => {
    const navigate = useNavigate();
    // 삐약! URL에서 상품 ID를 가져옵니다.
    const { id } = useParams<{ id: string }>(); 
    const productId = id ? parseInt(id, 10) : undefined;

    // 삐약! useQuery를 사용해서 특정 상품의 상세 정보를 가져옵니다!
    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', productId], // 삐약! 쿼리 키에 ID를 포함해서, ID가 바뀌면 다시 불러오도록 합니다.
        queryFn: () => {
            if (!productId) {
                throw new Error('상품 ID가 없습니다.');
            }
            return getProductDetail(productId);
        },
        enabled: !!productId, // 삐약! productId가 있을 때만 쿼리를 실행합니다.
    });

    // 삐약! 로딩 및 에러 상태 처리
    if (isLoading) {
        return <Layout subTitle="상품 상세 정보"><div>삐약! 상품 정보를 불러오는 중...</div></Layout>;
    }

    if (isError || !product) {
        return (
            <Layout subTitle="상품 상세 정보">
                <div>삐약! 상품 정보를 찾을 수 없거나 오류가 발생했어요.</div>
            </Layout>
        );
    }
    
    return (
        <Layout subTitle={`상품 상세 정보: ${product.fname}`}>
            <div className={styles.container}>
                <div className={styles.detailCard}>
                    <h2>상품명: {product.fname}</h2>
                    <p>출연진: {product.fcast}</p>
                    <p>사업자명: {product.businessName}</p>
                    <p>장르: {product.genrenm}</p>
                    <p>관람 연령: {product.fage}</p>
                    <p>공연장: {product.fcltynm}</p>
                    <p>공연장 주소: {product.faddress}</p>
                    <p>공연 시작일: {product.fdto}</p>
                    <p>공연 종료일: {product.fdfrom}</p>
                    {/* <p>공연 스케쥴: {product.festivalSchedules}</p> */}
                    <p>러닝 타임: {product.runningTime}</p>
                    <p>수용 인원: {product.availableNOP}명</p>
                    <p>가격: {product.ticketPrice}원</p>
                    <p>구매 매수 제한: {product.maxPurchase}</p>
                    <p>티켓 수령 방법: {product.fticketPick}</p>
                    {/* 삐약! 더 많은 상세 정보를 여기에 추가하세요! */}
                </div>
                <div className={styles.buttonWrapper}>
                    <Button onClick={() => navigate(-1)}>뒤로가기</Button>
                </div>
            </div>
        </Layout>
    );
};

export default ProductDetailPage;