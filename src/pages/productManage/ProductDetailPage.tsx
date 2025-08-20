import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import { getProductDetail, deleteProduct } from '@/shared/api/admin/host/festival';
import styles from './ProductDetailPage.module.css';
import type { FestivalScheduleDTO} from '@/models/admin/host/festival';

const ProductDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>(); 
    const fid = id ?? undefined;

    const { data: product, isLoading, isError } = useQuery({
        queryKey: ['product', id], 
        queryFn: () => getProductDetail(id!),
        enabled: !!id,
        select: (response) => response.data,
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] }); // 삐약! 'products' 쿼리 캐시를 무효화합니다!
            alert('상품이 성공적으로 삭제되었습니다!');
            navigate('/admin/productManage'); // 삐약! 상품 관리 페이지로 돌아갑니다!
        },
        onError: (error) => {
            console.error('상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다. 다시 시도해 주세요.');
        },
    });

    // 문자열이면 무시, File이면 revoke
    const cleanupFile = (file: string | File) => {
    if (typeof file !== "string") {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
    }
    };

    useEffect(() => {
        return () => {
            if (product?.posterFile) {
            cleanupFile(product.posterFile);
            }

            if (Array.isArray(product?.contentFile)) {
            product.contentFile.forEach(cleanupFile);
            }
        };
    }, [product]);



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

    const handleEditClick = () => {
        console.log('삐약! 수정 버튼 클릭!');
        navigate(`/admin/productRegist/${fid}`); 
    };

    const handleDeleteClick = () => {
        if (window.confirm('삐약! 정말로 이 상품을 삭제하시겠습니까?')) {
            mutate(fid as string);
        };
        
    };

    return (
        <Layout subTitle={`상품 상세 정보: ${product.fname}`}>
            <div className={styles.container}>
                <div className={styles.detailCard}>
                    <h2>상품명: {product.fname}</h2>
                    <p>출연진: {product.fcast}</p>
                    <p>기획사명: {product.entrpsnmH}</p>
                    <p>장르: {product.genrenm}</p>
                    <p>관람 연령: {product.prfage}</p>
                    <p>공연장: {product.fcltynm}</p>
                    <p>공연장 주소: {product.faddress}</p>
                    <p>공연 시작일: {product.fdto}</p>
                    <p>공연 종료일: {product.fdfrom}</p>
                    {product.schedules && product.schedules.length > 0 && (
                        <p>공연 스케줄: 
                            <span className={styles.scheduleTags}>
                                {product.schedules.map((schedule: FestivalScheduleDTO, index: number) => (
                                    <span key={index} className={styles.scheduleTag}>
                                        {`${schedule.dayOfWeek} - ${schedule.time}`}
                                    </span>
                                ))}
                            </span>
                        </p>
                    )}
                    <p>러닝 타임: {product.runningTime}</p>
                    <p>수용 인원: {product.availableNOP}명</p>
                    <p>가격: {product.ticketPrice}원</p>
                    <p>구매 매수 제한: {product.maxPurchase}</p>
                    <p>티켓 수령 방법: {product.ticketPick}</p>
                    <p>상세 정보: {product.story}</p>
                    <div className={styles.fileSection}>
                        <p>포스터 파일:</p>
                        {product.posterFile ? (
                            <img src={typeof product.posterFile === 'string' ? product.posterFile : URL.createObjectURL(product.posterFile)}
                            alt="포스터 이미지" className={styles.posterImage}/> ) : (
                            <span>없음</span>
                        )}

                        <p>상세 정보 이미지:</p>
                        <div className={styles.fileList}>
                            {product.contentFile?.length ? (product.contentFile.map((file, idx) => (
                                <img key={idx} src={typeof file === 'string' ? file : URL.createObjectURL(file)}
                                alt={`상세 이미지 ${idx + 1}`} className={styles.fileImage}/>
                            ))) : ( <span>없음</span>
                            )}
                        </div>
                    </div>

                </div>
                <div className={styles.buttonWrapper}>
                    <Button onClick={handleEditClick} disabled={isPending} variant="secondary">수정</Button>
                    <Button onClick={handleDeleteClick} disabled={isPending} variant="danger">삭제</Button>
                    <Button onClick={() => navigate(-1)}>뒤로가기</Button>
                </div>
            </div>
        </Layout>
    );
};

export default ProductDetailPage;