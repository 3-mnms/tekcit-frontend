import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import AnnouncementList from '@/components/announcement/AnnouncementList';
import styles from './AnnouncementListPage.module.css';

interface Announcement {
  id: number;
  genre: string;
  title: string;
  createdAt: string;
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    genre: '콘서트',
    title: '무료 물 나눔 장소',
    createdAt: '2025-07-25 14:00',
  },
  {
    id: 2,
    genre: '페스티벌',
    title: '현장 부스 운영 안내',
    createdAt: '2025-07-22 10:00',
  },
  {
    id: 3,
    genre: '뮤지컬',
    title: '티켓 예매 일정 변경',
    createdAt: '2025-07-20 18:30',
  },
];

const AnnouncementListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);

  const filtered = announcements.filter(
    (a) => a.genre.includes(searchTerm) || a.title.includes(searchTerm)
  );

  return (
    <Layout subTitle="공지사항 목록">
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>전체 공지 {filtered.length}건</h3>
          <div className={styles.controls}>
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
            <button className={styles.registerBtn}>+ 공지사항 등록</button>
          </div>
        </div>
        <div className={styles.tableSection}>
          <AnnouncementList announcements={filtered} />
        </div>
      </div>
    </Layout>
  );
};

export default AnnouncementListPage;