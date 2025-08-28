// src/components/my/reservation/ReservationTable.tsx
import React, { useMemo } from 'react';
import styles from './ReservationTable.module.css';
import { useNavigate } from 'react-router-dom';
import { useTicketsQuery } from '@/models/my/ticket/tanstack-query/useTickets';
import type { TicketListItem } from '@/models/my/ticket/ticketTypes';

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  statusFilter: string; // '전체' | '예매 완료' | '취소 완료' ...
}

const ReservationTable: React.FC<Props> = ({ startDate, endDate, statusFilter }) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTicketsQuery();

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      // 예매일 필터 (item.date = 'yyyy.MM.dd')
      const reservationDate = new Date(item.date.replaceAll('.', '-'));
      if (startDate && reservationDate < startDate) return false;
      if (endDate && reservationDate > endDate) return false;
      if (statusFilter !== '전체' && item.statusLabel !== statusFilter) return false;
      return true;
    });
  }, [data, startDate, endDate, statusFilter]);

  const handleRowClick = (row: TicketListItem) => {
    // 디테일 API는 reservationNumber로 조회하므로 파라미터도 그것으로!
    navigate(`/mypage/ticket/detail/${row.reservationNumber}`);
    // 만약 쿼리스트링으로 쓰고 싶다면:
    // navigate(`/mypage/ticket/detail?reservationNumber=${row.reservationNumber}`);
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="예매 내역">
        <thead>
          <tr>
            <th>예매일</th>
            <th>예매번호</th>
            <th>공연명</th>
            <th>일시</th>
            <th>매수</th>
            <th>예매상태</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td colSpan={6}>불러오는 중…</td></tr>
          )}
          {isError && (
            <tr><td colSpan={6}>목록 조회 실패: {(error as Error)?.message ?? '알 수 없는 오류'}</td></tr>
          )}
          {!isLoading && !isError && filteredData.length === 0 && (
            <tr><td colSpan={6}>조건에 맞는 예매 내역이 없습니다.</td></tr>
          )}
          {!isLoading && !isError && filteredData.map((item) => (
            <tr
              key={item.reservationNumber}
              onClick={() => handleRowClick(item)}
              className={styles.clickableRow}
            >
              <td>{item.date}</td>
              <td>{item.number}</td>
              <td>{item.title}</td>
              <td>{item.dateTime}</td>
              <td>{item.count}</td>
              <td>{item.statusLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;
