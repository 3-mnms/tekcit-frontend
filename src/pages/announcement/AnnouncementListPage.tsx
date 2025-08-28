import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import AnnouncementList from '@/components/announcement/AnnouncementList';
import AnnouncementModal from '@/components/announcement/AnnouncementModal';
import styles from './AnnouncementListPage.module.css';
import type { Announcement, NewAnnouncement } from '@/models/admin/Announcement';
import { getAnnouncements, updateAnnouncement, deleteAnnouncement, createAnnouncement } from '@/shared/api/admin/announcement';
import Button from '@/components/common/button/Button';

import {getProducts} from '@/shared/api/admin/festival'

const AnnouncementListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);


  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });

  const { data: festivals } = useQuery({
    queryKey: ['festivals'],
    queryFn: getProducts,
    select: (response) => response.data || [],
  });

  const saveMutation = useMutation({
    mutationFn: (announcementData: Announcement | NewAnnouncement) => {
      if ('scheduleId' in announcementData) {
        return updateAnnouncement(announcementData as Announcement);
      } else {
        return createAnnouncement(announcementData as NewAnnouncement);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      if ('scheduleId' in variables) {
        alert('공지사항이 수정되었습니다.');
      } else {
        alert('공지사항이 등록되었습니다.');
      }
      handleModalClose();
    },
    onError: (error) => {
      console.error("저장/수정 실패:", error);
      alert('작업에 실패했습니다.');
    }
});

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        alert('공지사항이 삭제되었습니다.');
    },
    onError: (error) => {
        console.error("삭제 실패:", error);
        alert('삭제에 실패했습니다.');
    }
  });

  const handleDelete = (scheduleId: number) => {
        const target = announcements?.find((a) => a.scheduleId === scheduleId);
        if (window.confirm(`'${target?.title}' 공지를 삭제하시겠습니까?`)) {
            deleteMutation.mutate(scheduleId);
        }
    };

  const handleEdit = (announcement: Announcement) => {
    setEditTarget(announcement);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditTarget(null);
  };

  const handleSave = (announcementData: Announcement | NewAnnouncement) => {
    saveMutation.mutate(announcementData);
  };

  const filtered = useMemo(() => {
    if (!announcements) return [];
    return announcements.filter(
        (a) => a.fname?.includes(searchTerm) || a.title.includes(searchTerm)
    );
  }, [announcements, searchTerm]);

  if (isLoading) return <Layout subTitle="공지사항 목록"><div>로딩 중...</div></Layout>;
  if (isError) return <Layout subTitle="공지사항 목록"><div>에러 발생!</div></Layout>;

  return (
    <Layout subTitle="공지사항 목록">
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>전체 공지 {filtered.length}건</h3>
          <div className={styles.controls}>
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
            <Button
              className={styles.registerBtn}
              onClick={() => {
                setEditTarget(null);
                setIsModalOpen(true);
              }}
            >
              + 공지사항 등록
            </Button>
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
          onSave={handleSave}
          editTarget={editTarget}
          festivals={festivals || []}
        />
      </div>
    </Layout>
  );
};

export default AnnouncementListPage;