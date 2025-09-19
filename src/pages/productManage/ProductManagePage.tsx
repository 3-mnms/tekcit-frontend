import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; 
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import Table, {type Column} from '@/components/shared/Table';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/spinner/Spinner';
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import { BiSkipPrevious } from "react-icons/bi";
import styles from './ProductManagePage.module.css';

import { getProducts } from '@/shared/api/admin/festival';
import type { Festival } from '@/models/admin/festival';

const PAGE_SIZE = 13;
const PAGE_RANGE = 5;

const ProductManagePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0); 

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['products', currentPage, searchTerm],
        queryFn: () => getProducts(currentPage, PAGE_SIZE, searchTerm),
        staleTime: 60_000,
         placeholderData: (previousData) => previousData,
     });

    const { content: displayedData, totalPages } = useMemo(() => {
    const content = data?.content || [];
    const total = data?.totalPages || 1;
        return { content, totalPages: total };
    }, [data]);

     const startPage = Math.floor(currentPage / PAGE_RANGE) * PAGE_RANGE;
    const endPage = Math.min(startPage + PAGE_RANGE, totalPages);
    const pageNumbers = Array.from({ length: endPage - startPage }, (_, i) => i + startPage);

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

     const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
    };

    const handlePageClick = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };


    if (isLoading) {
        return <Spinner />;
    }

    if (isError) {
        return (
        <Layout subTitle="상품 관리">
            <div>삐약! 데이터를 불러오지 못했어요.</div>
        </Layout>
        );
    }
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
                    data={displayedData}
                    onRowClick={handleRowClick}
                    getUniqueKey={(item) => item.fid}
                />
            </div>
            <div className={styles.paginationControls}>
                <button
                    className={styles.pageButton}
                    onClick={() => handlePageClick(0)}
                    disabled={currentPage === 0}
                >
                    «
                </button>
                <GrFormPrevious onClick={handlePrevPage} disabled={currentPage === 0} />
                {pageNumbers.map((pageNum) => (
                    <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        className={`${styles.pageButton} ${
                            currentPage === pageNum ? styles.active : ''
                        } ${currentPage === pageNum ? styles.underline : ''}`}
                    >
                        {pageNum + 1}
                    </button>
                ))}
                <GrFormNext
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages - 1}
                />
                <button
                    className={styles.pageButton}
                    onClick={() => handlePageClick(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                >
                    » ㅁ
                </button>
            </div>
        </Layout>
    );
};

export default ProductManagePage;