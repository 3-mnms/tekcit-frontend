import React from 'react';
import styles from './AnnouncementList.module.css';

interface Announcement {
  id: number;
  genre: string;
  title: string;
  createdAt: string;
}

interface Props {
  announcements: Announcement[];
}

const AnnouncementList: React.FC<Props> = ({ announcements }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>번호</th>
          <th>공연 장르</th>
          <th>제목</th>
          <th>등록 시간</th>
          <th className={styles.actionColumn}></th>
        </tr>
      </thead>
      <tbody>
        {announcements.map((a, idx) => (
          <tr key={a.id}>
            <td>{idx + 1}</td>
            <td>{a.genre}</td>
            <td>{a.title}</td>
            <td>{a.createdAt}</td>
            <td className={styles.actions}>
              <button className={styles.edit}>수정</button>
              <button className={styles.delete}>삭제</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AnnouncementList;
