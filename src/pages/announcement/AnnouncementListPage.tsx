import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/common/SearchBox';
import AnnouncementList from '@/components/announcement/AnnouncementList';
import AnnouncementModal from '@/components/announcement/AnnouncementModal';
import styles from './AnnouncementListPage.module.css';
import type { Announcement, NewAnnouncement } from '@/models/admin/Announcement';
import { getAnnouncements, updateAnnouncement, deleteAnnouncement, createAnnouncement } from '@/shared/api/admin/announcement';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/spinner/Spinner';

import {getProducts} from '@/shared/api/admin/festival'

const AnnouncementListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSent, setShowSent] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);


  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
  });

  const { data: festivals } = useQuery({
    queryKey: ['allFestivals'],
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
      const status = error.response?.status;
      if (status === 403) {
          alert('지금은 관리자 계정으로 로그인되어 있습니다. 다시 시도해주세요.');
      } else {
          console.error('상품 등록/수정 실패:', error);
          alert(`공지사항 등록에 실패했습니다.`);
      }
  },
});

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        alert('공지사항이 삭제되었습니다.');
    },
    onError: (error) => {
        // AxiosError 객체에서 서버 응답 상태 코드를 확인해.
        const status = error.response?.status;
        
        // 삐약! 서버에서 기한이 지난 공연이라 삭제할 수 없다고 알려줄 때!
        if (status === 500) {
            alert('기한이 지난 공연은 삭제할 수 없습니다!');
        } else {
            // 다른 종류의 에러가 났을 때
            console.error('상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다.');
        }
    },
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
    const filteredBySearch = announcements.filter(
        (a) => a.fname?.includes(searchTerm) || a.title.includes(searchTerm)
    );

    // 삐약! `showSent` 상태에 따라 다시 한번 필터링!
    if (showSent) {
        return filteredBySearch; // `true`면 전체 다 보여줘!
    } else {
        // `false`면 알림이 보내지지 않은 공지사항만 보여줘!
        return filteredBySearch.filter((a) => !a.sent);
    }
  }, [announcements, searchTerm, showSent]); // 삐약! `showSent`를 의존성 배열에 추가!


  if (isLoading) return <Spinner />;
  if (isError) return <Layout subTitle="공지사항 목록"><div>에러 발생!</div></Layout>;

  return (
    <Layout subTitle="공지사항 목록">
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>전체 공지 {filtered.length}건</h3>
          <div className={styles.controls}>
            <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
            <div className={styles.filterGroup}>
              <input
              type="checkbox"
              id="showSent"
              className={styles.filterCheckbox}
              checked={showSent}
              onChange={(e) => setShowSent(e.target.checked)}
              />
              <p>종료된 공지</p>
            </div>
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