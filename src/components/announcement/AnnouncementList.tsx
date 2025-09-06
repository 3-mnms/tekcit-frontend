import React from 'react';
import styles from './AnnouncementList.module.css';
import type { Announcement } from '@/models/admin/Announcement';
import Button from '../common/Button';
import type { Column } from '../shared/Table';
import Table from '../shared/Table';

interface Props {
  announcements: Announcement[];
  onDelete: (scheduleId: number) => void;
  onEdit: (announcement: Announcement) => void;
}

const AnnouncementList: React.FC<Props> = ({ announcements, onDelete, onEdit }) => {
   const columns: Column<Announcement>[] = [
    { columnId: 'fid', label: '공연 ID', style: { width: '7%' } },
    { columnId: 'fname', label: '공연 제목', style: { width: '25%' } },
    { columnId: 'title', label: '알림 제목', style: { width: '35%' } },
    { columnId: 'sendTime', label: '알람 발송 시간', style: { width: '15%' } },
    {
      columnId: 'actions' as keyof Announcement,
      label: '관리',
      style: { width: '10%' },
      render: (item) => (
        <div className={styles.buttons}>
          <Button onClick={() => onEdit(item)} variant="secondary">수정</Button>
          <Button onClick={() => onDelete(item.scheduleId)} variant="danger">삭제</Button>
        </div>
      ),
    },
  ];

  return (
    // 삐약! 🐥 직접 테이블을 만드는 대신, Table 컴포넌트를 사용해요.
    <Table
      columns={columns}
      data={announcements}
      getUniqueKey={(item) => item.scheduleId}
    />
  );
};

export default AnnouncementList;