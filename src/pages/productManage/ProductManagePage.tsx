import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import Table from '@/components/shared/Table';
import type {Column} from '@/components/shared/Table';
import Button from '@/components/common/Button';
import styles from './ProductManagePage.module.css';

import { getProducts } from '@/shared/api/festival';
import type { ProductType } from '@/models/festival';
import { USERROLE } from '@/models/User';
import { useAuth } from '@/models/dummy/useAuth';
// import { dummyProducts } from '@/models/dummy/dummyProducts';

const ProductManagePage: React.FC = () => {
    const navigate = useNavigate();
    // const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const { role, userId } = useAuth();

    // 삐약! useQuery를 사용해서 상품 목록을 가져옵니다!
    const { data: products, isLoading, isError, isFetching } = useQuery({
        queryKey: ['products', userId, searchTerm],
        queryFn: () => role === USERROLE.HOST ? getProducts(userId) : getProducts(),
        enabled: !!userId,
    });

    // 삐약! 이 부분에서 상품 클릭 시 상세 페이지로 이동합니다!
    const handleRowClick = (product: ProductType) => {
        navigate(`/product-detail/${product.id}`);
    };

    // 삐약! 버튼 클릭 핸들러를 따로 만듭니다!
    const handleViewTicketHolderList = (e: React.MouseEvent, productId: number) => {
        e.stopPropagation(); // 삐약! 행 클릭 이벤트가 발생하는 것을 막아줍니다!
        navigate(`/productManage/${productId}/TicketHolderList`);
    };

    const handleViewStats = (e: React.MouseEvent, productId: number) => {
        e.stopPropagation(); // 삐약! 행 클릭 이벤트가 발생하는 것을 막아줍니다!
        navigate(`/productManage/Statistics/${productId}`);
    };

    const columns: Column<ProductType>[] = [
        { columnId: 'id', label: 'id' },
        { columnId: 'fname', label: '상품명' },
        { columnId: 'genrenm', label: '장르' },
        { columnId: 'businessName', label: '사업자명' },
        {
            columnId: 'actions' as keyof ProductType,// 삐약! pid를 기준으로 렌더링할게요!
            label: '액션',
            render: (item) => (
                <div className={styles.buttons}>
                    <Button onClick={(e) => handleViewTicketHolderList(e, item.id)}>예매자명단</Button>
                    <Button onClick={(e) => handleViewStats(e, item.id)}>통계 조회</Button>
                </div>
            )
        },
    ];

    // 삐약! 로딩 및 에러 상태를 처리하는 UI를 추가합니다!
    if (isLoading) {
        return <Layout subTitle="상품 관리"><div>삐약! 상품 목록을 불러오는 중...</div></Layout>;
    }

    if (isError) {
        return <Layout subTitle="상품 관리"><div>삐약! 오류가 발생했어요. 다시 시도해 주세요.</div></Layout>;
    }


    return (
        <Layout subTitle="상품 관리">
            <div className={styles.container}>
                <div className={styles.searchBar}>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearch={setSearchTerm} 
                    />
                </div>
                {isFetching && <div className={styles.loadingIndicator}>삐약! 새로운 상품 목록을 가져오는 중...</div>}
                <Table 
                    columns={columns} 
                    data={products || []}
                    onRowClick={handleRowClick}
                />
            </div>
        </Layout>
    );
};

export default ProductManagePage;