import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import AnnouncementList from '@/components/announcement/AnnouncementList';
import AnnouncementModal from '@/components/announcement/AnnouncementModal';
import styles from './AnnouncementListPage.module.css';
import type { Announcement } from '@/models/Announcement';

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    genre: '콘서트',
    title: '무료 물 나눔 장소',
    content: '정문 부스에서 나눔 예정입니다.',
    createdAt: '2025-07-25 14:00',
  },
  {
    id: 2,
    genre: '페스티벌',
    title: '현장 부스 운영 안내',
    content: '운영 시간: 12시~20시까지',
    createdAt: '2025-07-22 10:00',
  },
  {
    id: 3,
    genre: '뮤지컬',
    title: '티켓 예매 일정 변경',
    content: '예매 오픈: 2025-08-01',
    createdAt: '2025-07-20 18:30',
  },
];

const AnnouncementListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);

  const fetchFromLocalStorage = () => {
    const stored = localStorage.getItem('announcements');
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    } else {
      localStorage.setItem('announcements', JSON.stringify(DEFAULT_ANNOUNCEMENTS));
      setAnnouncements(DEFAULT_ANNOUNCEMENTS);
    }
  };

  useEffect(() => {
    fetchFromLocalStorage();
  }, []);

  const handleDelete = (id: number) => {
    const target = announcements.find((a) => a.id === id);
    const confirmDelete = window.confirm(`'${target?.title}' 공지를 삭제하시겠습니까?`);
    if (!confirmDelete) return;

    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('announcements', JSON.stringify(updated));
  };

  const handleEdit = (announcement: Announcement) => {
    setEditTarget(announcement);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditTarget(null);
  };

  const filtered = announcements.filter(
    (a) => a.genre.includes(searchTerm) || a.title.includes(searchTerm),
  );

  return (
    <Layout subTitle="공지사항 목록">
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>전체 공지 {filtered.length}건</h3>
          <div className={styles.controls}>
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
            <button
              className={styles.registerBtn}
              onClick={() => {
                setEditTarget(null);
                setIsModalOpen(true);
              }}
            >
              + 공지사항 등록
            </button>
          </div>
        </div>
        <div className={styles.tableSection}>
          <AnnouncementList
            announcements={filtered}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </div>

        <AnnouncementModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={fetchFromLocalStorage}
          editTarget={editTarget}
        />
      </div>
    </Layout>
  );
};

export default AnnouncementListPage;