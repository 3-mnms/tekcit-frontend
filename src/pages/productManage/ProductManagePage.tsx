import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import Table, {type Column} from '@/components/shared/Table';
import Button from '@/components/common/Button';
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import styles from './ProductManagePage.module.css';
import Spinner from '@/components/common/spinner/Spinner';
import { getProducts } from '@/shared/api/admin/festival';
import type { Festival } from '@/models/admin/festival';

const ProductManagePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const [page, setPage] = useState(0); 
    const pageSize = 13;

    const { 
        data: allProducts,
        isLoading, 
        isError,
    } = useQuery({
        queryKey: ['products', page], 
        queryFn: () => getProducts(page, pageSize), 
        select: (response) => {
            const festivalList = response?.data;

            if (!festivalList || !Array.isArray(festivalList)) {
                return [];
            }            
            return festivalList.map(festival => ({
                ...festival,
                detail: {
                    ...festival.detail,
                    fcast: typeof festival.detail.fcast === 'string' 
                        ? festival.detail.fcast.split(',').map(s => s.trim()) 
                        : [],
                }
            }));
        },
        placeholderData: (previousData) => previousData,
    });

    const filteredProducts = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!allProducts) return [];
        if (!lowercasedTerm) return allProducts; 

        return allProducts.filter(product =>
            product.fname?.toLowerCase().includes(lowercasedTerm) ||
            product.detail?.entrpsnmH?.toLowerCase().includes(lowercasedTerm)
        );
    }, [allProducts, searchTerm]);

    const handleRowClick = (item: Festival) => {
        navigate(`/admin/product-detail/${item.fid}`);
    };

    const handleViewTicketHolderList = (e: React.MouseEvent, fid: string) => {
        e.stopPropagation(); // 삐약! 행 클릭 이벤트가 발생하는 것을 막아줍니다!
        navigate(`/admin/productManage/TicketHolderList/${fid}`);
    };

    const handleViewStats = (e: React.MouseEvent, fid: string) => {
        e.stopPropagation();
        navigate(`/admin/productManage/Statistics/${fid}`);
    };

    const columns: Column<Festival>[] = [
    { columnId: 'fid', label: 'id', style: { width: '7%' } },
    { 
        columnId: 'fname', 
        label: '상품명', 
        style: { width:'40%' }
    },
    { columnId: 'genrenm', label: '장르', style: { width: '12%' } },
    { columnId: 'fcltynm', label: '공연장 이름', style: { width: '15%'} },
    {
        columnId: 'entrpsnmH',
        label: '주최자명',
        render: (item) => <span>{item.detail?.entrpsnmH}</span>,
        style: { width: '150px', minWidth: '10%' }
    },
    {
        columnId: 'actions' as keyof Festival,
        label: '액션',
        render: (item) => (
        <div className={styles.buttons}>
            <Button onClick={(e) => handleViewTicketHolderList(e, item.fid)}>예매자명단</Button>
            <Button onClick={(e) => handleViewStats(e, item.fid)}>통계 조회</Button>
        </div>
        ),
        style: { width: '15%' }
    },
    ];

    if (isLoading) {
        return <Spinner />
    }

    if (isError) {
        return <Layout subTitle="상품 관리"><div>삐약! 오류가 발생했어요. 다시 시도해 주세요.</div></Layout>;
    }

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePrevPage = () => {
        setPage(prevPage => Math.max(0, prevPage - 1));
    };

    return (
        <Layout subTitle="상품 관리 ">
            <div className={styles.container}>
                <div className={styles.searchBar}>
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearch={setSearchTerm} 
                    />
                </div>
                <Table 
                    columns={columns} 
                    data={filteredProducts}
                    onRowClick={handleRowClick}
                    getUniqueKey={(item) => item.fid}
                />
                <div className={styles.paginationControls}>
                    <GrFormPrevious onClick={handlePrevPage} disabled={page === 0}/>

                    <span>현재 페이지: {page + 1}</span>
                    <GrFormNext onClick={handleNextPage}/>
                </div>
            </div>
        </Layout>
    );
};

export default ProductManagePage;