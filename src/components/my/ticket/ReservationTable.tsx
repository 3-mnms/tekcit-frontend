import React from 'react';
import styles from './ReservationTable.module.css';
import { useNavigate } from 'react-router-dom';

interface Reservation {
  id: number;
  date: string; 
  number: string;
  title: string;
  dateTime: string;
  count: number;
  status: string;
}

interface Props {
  startDate: Date | null;
  endDate: Date | null;
}

const dummyData: Reservation[] = [
  {
    id: 1,
    date: '2025.07.01',
    number: 'A123456',
    title: '그린플러그드 페스티벌',
    dateTime: '2025.10.18 17:00',
    count: 2,
    status: '결제 완료',
  },
  {
    id: 2,
    date: '2025.06.15',
    number: 'B654321',
    title: 'GMF 2025',
    dateTime: '2025.10.19 18:00',
    count: 1,
    status: '취소 완료',
  },
];

const ReservationTable: React.FC<Props> = ({ startDate, endDate }) => {
  const navigate = useNavigate();

  const handleRowClick = (id: number) => {
    navigate(`/mypage/ticket/detail/${id}`);
  };

  const filteredData = dummyData.filter((item) => {
    const reservationDate = new Date(item.date.replace(/\./g, '-')); // '2025.07.01' -> '2025-07-01'
    if (startDate && reservationDate < startDate) return false;
    if (endDate && reservationDate > endDate) return false;
    return true;
  });

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
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
          {filteredData.map((item) => (
            <tr key={item.id} onClick={() => handleRowClick(item.id)} className={styles.clickableRow}>
              <td>{item.date}</td>
              <td>{item.number}</td>
              <td>{item.title}</td>
              <td>{item.dateTime}</td>
              <td>{item.count}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;