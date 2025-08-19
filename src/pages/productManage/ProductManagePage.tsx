import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import Table, {type Column} from '@/components/shared/Table';
import Button from '@/components/common/Button';
import styles from './ProductManagePage.module.css';

import { getProducts } from '@/shared/api/admin/host/festival';
import type { Festival } from '@/models/admin/host/festival';

const ProductManagePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { 
        data: products, 
        isLoading, 
        isError,
    } = useQuery({
        queryKey: ['products'], 
        queryFn: getProducts, 
        select: (response) => {
            const festivalList = response.data;
            return festivalList.map(festival => ({
                ...festival,
                fcast: typeof festival.fcast === 'string' ? festival.fcast.split(',').map(s => s.trim()) : [],
            }));
        }
    });

    // 삐약! 이 부분에서 상품 클릭 시 상세 페이지로 이동합니다!
    const handleRowClick = (item: Festival) => {
        navigate(`/product-detail/${item.fid}`);
    };

    // 삐약! 버튼 클릭 핸들러를 따로 만듭니다!
    const handleViewTicketHolderList = (e: React.MouseEvent, fid: string) => {
        e.stopPropagation(); // 삐약! 행 클릭 이벤트가 발생하는 것을 막아줍니다!
        navigate(`/productManage/${fid}/TicketHolderList`);
    };

    const handleViewStats = (e: React.MouseEvent, fid: string) => {
        e.stopPropagation(); // 삐약! 행 클릭 이벤트가 발생하는 것을 막아줍니다!
        navigate(`/productManage/Statistics/${fid}`);
    };

    const columns: Column<Festival>[] = [
        { columnId: 'id', label: 'id' },
        { columnId: 'fname', label: '상품명' },
        { columnId: 'genrenm', label: '장르' },
        { columnId: 'entrpsnmH', label: '주최자명'},
        {
            columnId: 'actions' as keyof Festival,// 삐약! pid를 기준으로 렌더링할게요!
            label: '액션',
            render: (item) => (
                <div className={styles.buttons}>
                    <Button onClick={(e) => handleViewTicketHolderList(e, item.fid)}>예매자명단</Button>
                    <Button onClick={(e) => handleViewStats(e, item.fid)}>통계 조회</Button>
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
                <Table 
                    columns={columns} 
                    data={products || []}
                    onRowClick={handleRowClick}
                    getUniqueKey={(item) => item.id}
                />
            </div>
        </Layout>
    );
};

export default ProductManagePage;