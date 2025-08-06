import React from 'react';
import styles from './ReservationTable.module.css';

const dummyData = [
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
    date: '2025.07.02',
    number: 'B654321',
    title: 'GMF 2025',
    dateTime: '2025.10.19 18:00',
    count: 1,
    status: '취소 완료',
  },
];

const ReservationTable: React.FC = () => {
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
          {dummyData.map((item) => (
            <tr key={item.id}>
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
