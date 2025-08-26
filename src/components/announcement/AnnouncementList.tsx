import React from 'react';
import styles from './AnnouncementList.module.css';
import type { Announcement } from '@/models/admin/Announcement';
import Button from '../common/Button';

interface Props {
  announcements: Announcement[];
  onDelete: (id: number) => void;
  onEdit: (announcement: Announcement) => void;
}

const AnnouncementList: React.FC<Props> = ({ announcements, onDelete, onEdit }) => {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>공연 장르</th>
          <th>제목</th>
          <th>작성일</th>
          <th className={styles.actionColumn}>관리</th>
        </tr>
      </thead>
      <tbody>
        {announcements.map((a) => (
          <tr key={a.id}>
            <td>{a.genre}</td>
            <td>{a.title}</td>
            <td>{a.createdAt}</td>
            <td className={styles.actions}>
              <Button onClick={() => onEdit(a)}>수정</Button>
              <Button onClick={() => onDelete(a.id)}>삭제</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AnnouncementList;