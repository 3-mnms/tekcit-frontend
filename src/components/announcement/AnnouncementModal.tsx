import React, { useState, useEffect } from 'react';
import styles from './AnnouncementModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editTarget?: {
    id: number;
    title: string;
    genre: string;
    content: string;
  } | null;
}

const AnnouncementModal: React.FC<Props> = ({ isOpen, onClose, onSave, editTarget }) => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title);
      setGenre(editTarget.genre);
      setContent(editTarget.content);
    } else {
      setTitle('');
      setGenre('');
      setContent('');
    }
  }, [editTarget]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title || !genre || !content) {
      alert('모든 항목을 입력해주세요!');
      return;
    }

    const stored = localStorage.getItem('announcements');
    const announcements = stored ? JSON.parse(stored) : [];

    if (editTarget) {
      const updated = announcements.map((a: any) =>
        a.id === editTarget.id ? { ...a, title, genre, content } : a
      );
      localStorage.setItem('announcements', JSON.stringify(updated));
      alert('공지사항이 수정되었습니다!');
    } else {
      const newAnnouncement = {
        id: Date.now(),
        title,
        genre,
        content,
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
        <h2 className={styles.title}>공지사항 작성</h2>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>공연 장르</label>
        <input value={genre} onChange={(e) => setGenre(e.target.value)} />

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