import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Table from '@/components/shared/Table';
import type { Column } from '@/components/shared/Table';
import { getAttendeesByFestivalId } from '@/shared/api/admin/festival';
import type { TicketHolderType } from '@/models/admin/User'; 
import styles from './TicketHolderListPage.module.css';
import SearchBar from '@/components/common/SearchBox';
import Spinner from '@/components/common/spinner/Spinner';

const TicketHolderListPage: React.FC = () => {
    const { fid } = useParams<{ fid: string }>();
    const navigate = useNavigate();

     
    const [searchTerm, setSearchTerm] = useState('');
    const { data: attendees, isLoading, isError } = useQuery({
        queryKey: ['attendees', fid],
        queryFn: () => {
            if (!fid) {
                throw new Error('페스티벌 ID가 없습니다.');
            }
            return getAttendeesByFestivalId(fid);
        },
        enabled: !!fid,
    });

    const filteredAttendees = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!attendees) return []; // 데이터가 없으면 빈 배열 반환
        if (!lowercasedTerm) return attendees; // 검색어가 없으면 전체 목록 반환

        // 이름, 예매번호, 전화번호로 검색
        return attendees.filter(attendee => 
            attendee.name?.toLowerCase().includes(lowercasedTerm) ||
            attendee.reservationNumber?.toLowerCase().includes(lowercasedTerm) ||
            attendee.phone?.toLowerCase().includes(lowercasedTerm)
        );
    }, [attendees, searchTerm]);

    const columns: Column<TicketHolderType>[] = [
        { columnId: 'reservationNumber', label: '예매번호' },
        { columnId: 'userName', label: '이름' },
        { columnId: 'selectedTicketCount', label: '티켓 수량' },
        { columnId: 'phoneNumber', label: '전화번호' },
        { columnId: 'deliveryMethod', label: '수령 방법' },
        { columnId: 'address', label: '주소' },
        { columnId: 'performanceDate', label: '페스티벌 날짜' },
    ];

    if (isLoading) {
        <Spinner/>
    }

    if (isError || !attendees) {
        return (
            <Layout subTitle="예매자 명단">
                <div>예매자 명단을 불러오는데 실패했거나 정보가 없습니다.</div>
            </Layout>
        );
    }

    return (
        <Layout subTitle={`예매자 명단`}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h3 className={styles.totalText}>
                        {searchTerm ? `검색 결과 ${filteredAttendees.length}명` : `전체 ${attendees?.length || 0}명`}
                    </h3>
                    <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
                </div>
                <Table<TicketHolderType> columns={columns} data={attendees} getUniqueKey={(attendee) => attendee.reservationNumber} />
                <div className={styles.buttonWrapper}>
                    <Button onClick={() => navigate(-1)}>뒤로가기</Button>
                </div>
            </div>
        </Layout>
    );
};

export default TicketHolderListPage;