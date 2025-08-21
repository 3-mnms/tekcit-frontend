import React, { useState, useEffect } from 'react';
import styles from './AnnouncementModal.module.css';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/shared/api/admin/host/festival'; 
// import type { Festival } from '@/models/admin/host/festival';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editTarget?: any;
}

const AnnouncementModal: React.FC<Props> = ({ isOpen, onClose, onSave, editTarget }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>('');
  const [announcementDate, setAnnouncementDate] = useState('');
  const [dispatchTime, setDispatchTime] = useState('');

  const { data: festivals, isLoading: isLoadingFestivals } = useQuery({
      queryKey: ['allFestivalsForNotice'], // 다른 목록과 겹치지 않게 고유한 키를 사용!
      queryFn: () => getProducts(),
      enabled: isOpen, // 모달이 열릴 때만 데이터를 불러와서 효율적이야!
      select: (response) => response.data, // 실제 데이터 배열만 사용
  });

  useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title);
      setContent(editTarget.content);
      setSelectedFestivalId(editTarget.festivalId);
      setAnnouncementDate(editTarget.announcementDate);
      setDispatchTime(editTarget.dispatchTime);
    } else {
      setTitle('');
      setContent('');
      setSelectedFestivalId('');
      setAnnouncementDate('');
      setDispatchTime('');
    }
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const selectedFestival = festivals?.find(f => f.id === selectedFestivalId);

  const handleSubmit = () => {
    if (!title || !selectedFestivalId || !announcementDate || !dispatchTime || !content) {
      alert('모든 항목을 입력해주세요!');
      return;
    }

    const stored = localStorage.getItem('announcements');
    const announcements = stored ? JSON.parse(stored) : [];

    if (editTarget) {
      const updated = announcements.map((a: any) =>
        a.id === editTarget.id ? { ...a, title, content } : a
      );
      localStorage.setItem('announcements', JSON.stringify(updated));
      alert('공지사항이 수정되었습니다!');
    } else {
      const newAnnouncement = {
        id: editTarget ? editTarget.id : Date.now(),
        title,
        content,
        festivalId: selectedFestivalId,
        festivalName: selectedFestival?.prfnm,
        announcementDate,
        dispatchTime,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      const updated = [...announcements, newAnnouncement];
      localStorage.setItem('announcements', JSON.stringify(updated));
      alert('공지사항이 저장되었습니다!');
    }

    onSave();
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>{editTarget ? '공지사항 수정' : '공지사항 작성'}</h2>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <label htmlFor="festival-select">페스티벌 선택</label>
        <select 
          id="festival-select"
          value={selectedFestivalId} 
          onChange={(e) => setSelectedFestivalId(e.target.value)}
          disabled={isLoadingFestivals}
        > <option value="">{isLoadingFestivals ? '불러오는 중...' : '페스티벌을 선택하세요'}</option>
          {festivals?.map(festival => (
              <option key={festival.id} value={festival.id}>
                  {festival.prfnm}
              </option>
          ))}</select>

        <label htmlFor="announcement-date">공지 날짜</label>
          <input
              id="announcement-date"
              type="date"
              value={announcementDate}
              onChange={(e) => setAnnouncementDate(e.target.value)}
              disabled={!selectedFestival}
              min={selectedFestival?.prfpdfrom}
              max={selectedFestival?.prfpdto}
          />

         <label htmlFor="dispatch-time">발송 예약 시간</label>
          <input
              id="dispatch-time"
              type="time"
              value={dispatchTime}
              onChange={(e) => setDispatchTime(e.target.value)}
          />

        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>내용</label>
        <textarea
          value={content}
          maxLength={50}
          onChange={(e) => setContent(e.target.value)}
          placeholder="50자 이내로 써주세요"
        />

        <p className={styles.warning}>
          ** 공지사항 작성 시 전체 알림 공유됩니다. 신중히 작성해주세요. **
        </p>

        <div className={styles.buttons}>
          <button className={styles.save} onClick={handleSubmit}>
            저장
          </button>
          <button className={styles.cancel} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;