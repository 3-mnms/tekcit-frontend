// src/components/admin/announcement/AnnouncementModal.tsx

import React, { useState, useEffect, useMemo } from 'react';
import styles from './AnnouncementModal.module.css';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/shared/api/admin/festival';
import Button from '@/components/common/Button';
// import type { Festival } from '@/models/admin/festival';

// --- 작은 컴포넌트들 
interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: string;
  maxDate?: string;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, minDate, maxDate }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    useEffect(() => { if (minDate) setCurrentMonth(new Date(minDate)); }, [minDate]);
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startDate.getDay();
    const dates = [];
    for (let i = 0; i < startDay; i++) { dates.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>); }
    for (let i = 1; i <= endDate.getDate(); i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const minDateTime = minDate ? new Date(minDate).setHours(0,0,0,0) : 0;
        const maxDateTime = maxDate ? new Date(maxDate).setHours(0,0,0,0) : Infinity;
        const isOutOfRange = date.getTime() < minDateTime || date.getTime() > maxDateTime;
        dates.push(<button key={i} className={`${styles.calendarDay} ${isSelected ? styles.selected : ''} ${isOutOfRange ? styles.disabled : ''}`} onClick={() => !isOutOfRange && onDateSelect(date)} disabled={isOutOfRange}>{i}</button>);
    }
    const changeMonth = (amount: number) => { setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1)); };
    return (<div className={styles.calendar}><div className={styles.calendarHeader}><button onClick={() => changeMonth(-1)}>&lt;</button><span>{`${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`}</span><button onClick={() => changeMonth(1)}>&gt;</button></div><div className={styles.calendarGrid}>{['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className={styles.calendarDayName}>{day}</div>)}{dates}</div></div>);
};

interface TimeSelectorProps {
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
    availableTimes: string[];
}
const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onTimeSelect, availableTimes }) => {
    if (availableTimes.length === 0) { return <div className={styles.timeSelectorDisabled}>날짜를 먼저 선택해주세요.</div>; }
    return (<div className={styles.timeSelector}>{availableTimes.map(time => (<button key={time} className={`${styles.timeButton} ${selectedTime === time ? styles.selected : ''}`} onClick={() => onTimeSelect(time)}>{time}</button>))}</div>);
};


// --- 메인 모달 컴포넌트 ---
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newAnnouncement: any) => void;
  editTarget?: any;
}

const AnnouncementModal: React.FC<Props> = ({ isOpen, onClose, onSave, editTarget }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  // ✅ 삐약! 발송 예약 날짜와 시간을 위한 새로운 상태!
  const [dispatchDate, setDispatchDate] = useState('');
  const [dispatchTime, setDispatchTime] = useState('');

  const { data: festivals, isLoading: isLoadingFestivals } = useQuery({
      queryKey: ['allFestivalsForNotice'],
      queryFn: () => getProducts(),
      enabled: isOpen,
      select: (response) => response.data,
  });

  const selectedFestival = useMemo(() => {
    return festivals?.find(f => f.fid === selectedFestivalId);
  }, [festivals, selectedFestivalId]);

  const festivalTimes = useMemo(() => {
    if (!selectedFestival) return [];
    // TODO: API 응답 Festival 타입에 availableTimes: string[] 같은 속성이 필요해요!
    if (selectedFestival.detail?.availableTimes) {
        return selectedFestival.detail.availableTimes;
    }
    return ['14:00', '17:00', '19:30'];
  }, [selectedFestival]);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
  }, [selectedFestivalId]);

  useEffect(() => {
    if (editTarget && isOpen) {
      setTitle(editTarget.title);
      setContent(editTarget.content);
      setSelectedFestivalId(editTarget.festivalId);
    } else {
      setTitle('');
      setContent('');
      setSelectedFestivalId('');
      setSelectedDate(null);
      setSelectedTime(null);
      setDispatchDate('');
      setDispatchTime('');
    }
  }, [editTarget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title || !selectedFestivalId || !selectedDate || !selectedTime || !content || !dispatchDate || !dispatchTime) {
      alert('모든 항목을 선택하고 입력해주세요!');
      return;
    }

    const formattedDispatchDateTime = `${dispatchDate.replace(/-/g, '')} ${dispatchTime}`;

    const newAnnouncement = {
      id: editTarget ? editTarget.id : Date.now(),
      title,
      content,
      festivalId: selectedFestivalId,
      festivalName: selectedFestival?.fname,
      targetDate: selectedDate.toISOString().slice(0, 10),
      targetTime: selectedTime,
      dispatchDateTime: formattedDispatchDateTime, 
      createdAt: new Date().toISOString(),
    };
    
    onSave(newAnnouncement);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
            <h2 className={styles.modalTitle}>{editTarget ? '공지사항 수정' : '공지사항 작성'}</h2>
            <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.contentWrapper}>
            {/* 왼쪽 패널 */}
            <div className={styles.leftPanel}>
                <div className={styles.formGroup}>
                    <label>페스티벌 선택</label>
                    <select 
                      value={selectedFestivalId} 
                      onChange={(e) => setSelectedFestivalId(e.target.value)}
                      disabled={isLoadingFestivals}
                    >
                      <option value="">{isLoadingFestivals ? '불러오는 중...' : '페스티벌을 선택하세요'}</option>
                      {festivals?.map(festival => (
                          <option key={festival.fid} value={festival.fid}>
                              {festival.fname}
                          </option>
                      ))}
                    </select>
                </div>
                
                {selectedFestivalId && (
                    <>
                        <div className={styles.formGroup}>
                            <label>공지 대상 날짜</label>
                            <Calendar 
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                                minDate={selectedFestival?.prfpdfrom}
                                maxDate={selectedFestival?.prfpdto}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>공지 대상 시간</label>
                            <TimeSelector 
                                selectedTime={selectedTime} 
                                onTimeSelect={setSelectedTime}
                                availableTimes={festivalTimes}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* 오른쪽 패널 */}
            <div className={styles.rightPanel}>
                <div className={styles.formGroup}>
                    <label>제목</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지사항 제목을 입력하세요." />
                </div>
                <div className={styles.formGroup}>
                    <label>내용</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="공지사항 내용을 입력하세요."
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>발송 예약 시간</label>
                    <div className={styles.dispatchTimeWrapper}>
                        <input
                            type="date"
                            value={dispatchDate}
                            onChange={(e) => setDispatchDate(e.target.value)}
                        />
                        <input
                            type="time"
                            value={dispatchTime}
                            onChange={(e) => setDispatchTime(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className={styles.footer}>
            <p className={styles.warning}>
              ** 공지사항 작성 시 전체 알림 공유됩니다. 신중히 작성해주세요. **
            </p>
            <div className={styles.buttons}>
              <Button variant="cancel" onClick={onClose}>취소</Button>
              <Button variant="primary" onClick={handleSubmit}>저장</Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
