// src/pages/admin/AttendeeListPage.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import { getAttendeesByFestivalId } from '@/shared/api/festival';
import type { TicketHolderType } from '@/models/User'; 
import styles from './TicketHolderListPage.module.css';

const TicketHolderListPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const festivalId = id ? parseInt(id, 10) : undefined;

    const { data: attendees, isLoading, isError } = useQuery({
        queryKey: ['attendees', festivalId],
        queryFn: () => {
            if (!festivalId) {
                throw new Error('페스티벌 ID가 없습니다.');
            }
            return getAttendeesByFestivalId(festivalId);
        },
        enabled: !!festivalId,
    });

    // 삐약! Table 컴포넌트에 넘겨줄 columns를 정의합니다!
    const columns: Column<TicketHolderType>[] = [
        { columnId: 'reservation_number', label: '예매번호' },
        { columnId: 'name', label: '이름' },
        { columnId: 'maxPurchase', label: '티켓 수량' },
        { columnId: 'phone', label: '전화번호' },
        { columnId: 'delivery_method', label: '수령 방법' },
        { columnId: 'address', label: '주소' },
        { columnId: 'festival_date', label: '페스티벌 날짜' },
    ];

    if (isLoading) {
        return <Layout subTitle="예매자 명단"><div>삐약! 예매자 명단을 불러오는 중...</div></Layout>;
    }

    if (isError || !attendees) {
        return (
            <Layout subTitle="예매자 명단">
                <div>삐약! 예매자 명단을 불러오는데 실패했거나 정보가 없습니다.</div>
            </Layout>
        );
    }

    return (
        <Layout subTitle={`예매자 명단 (${festivalId ? festivalId : '...'})`}>
            <div className={styles.container}>
                <Table<TicketHolderType> columns={columns} data={attendees} />
                <div className={styles.buttonWrapper}>
                    <Button onClick={() => navigate(-1)}>뒤로가기</Button>
                </div>
            </div>
        </Layout>
    );
};

export default TicketHolderListPage;