
import React, { useState, useEffect, useMemo } from 'react';
import styles from './AnnouncementModal.module.css';
import Button from '@/components/common/Button';
import type { Announcement, NewAnnouncement } from '@/models/admin/Announcement';
import type { DayOfWeek, Festival } from '@/models/admin/festival';

// --- 작은 컴포넌트들 
interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: string;
  maxDate?: string;
  availableDaysOfWeek?: DayOfWeek[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, minDate, maxDate, availableDaysOfWeek}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    useEffect(() => { if (minDate) setCurrentMonth(new Date(minDate)); }, [minDate]);
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDay = startDate.getDay();
    const dayOfWeekMap: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dates = [];
    for (let i = 0; i < startDay; i++) { dates.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>); }
    for (let i = 1; i <= endDate.getDate(); i++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const minDateTime = minDate ? new Date(minDate).setHours(0,0,0,0) : 0;
        const maxDateTime = maxDate ? new Date(maxDate).setHours(0,0,0,0) : Infinity;
        const currentDayString = dayOfWeekMap[date.getDay()];
        const isDayUnavailable = availableDaysOfWeek && availableDaysOfWeek.length > 0 && !availableDaysOfWeek.includes(currentDayString);
        const isDisabled = date.getTime() < minDateTime || date.getTime() > maxDateTime || isDayUnavailable;

        dates.push(
            <button 
                key={i} 
                className={`${styles.calendarDay} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`} 
                onClick={() => !isDisabled && onDateSelect(date)} 
                disabled={isDisabled}
            >
                {i}
            </button>
        );
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
  onSave: (data: Announcement | NewAnnouncement) => void; 
  editTarget?: Announcement | null;
  festivals: Festival[];
}

const AnnouncementModal: React.FC<Props> = ({ isOpen, onClose, onSave, editTarget, festivals}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dispatchDate, setDispatchDate] = useState('');
  const [dispatchTime, setDispatchTime] = useState('');

  const isLoadingFestivals = festivals.length === 0;

  const selectedFestival = useMemo(() => {
    return festivals?.find(f => f.fid === selectedFestivalId);
  }, [festivals, selectedFestivalId]);

  useEffect(() => {
  if (selectedFestival) {
    // console.log("선택된 축제 정보:", selectedFestival);
  }
}, [selectedFestival]);

  const availableTimes = useMemo(() => {
    if (!selectedFestival || !selectedDate) {
      return [];
    }
    const dayIndex = selectedDate.getDay();
    const dayOfWeekMap: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const targetDayString = dayOfWeekMap[dayIndex];

    const dailySchedules = selectedFestival.schedules.filter(
    (item) => item.dayOfWeek === targetDayString
    );
    const times = dailySchedules.map((schedule) => schedule.time);

    return times;
    
  }, [selectedFestival, selectedDate]);

  const availableDaysOfWeek = useMemo(() => {
    if (!selectedFestival) {
      return []; // 축제가 없으면 빈 배열
    }
    const uniqueDays = new Set(selectedFestival.schedules.map(schedule => schedule.dayOfWeek));
    return Array.from(uniqueDays);
  }, [selectedFestival]);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedTime(null);
  }, [selectedFestivalId]);

  useEffect(() => {
    if (isOpen && editTarget) {
        setTitle(editTarget.title);
        setContent(editTarget.body);
        setSelectedFestivalId(editTarget.fid);

        const targetStartAt = new Date(editTarget.startAt);
        setSelectedDate(targetStartAt);
        setSelectedTime(targetStartAt.toTimeString().slice(0, 5));

        const [dispatchDatePart, dispatchTimePart] = editTarget.sendTime.split('T');
        setDispatchDate(dispatchDatePart);
        // HH:MM 부분만 가져오기
        setDispatchTime(dispatchTimePart.slice(0, 5));

    } else if (isOpen) {
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
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // getMonth()는 0부터 시작하므로 +1, padStart로 09처럼 만들어줘요.
    const day = String(selectedDate.getDate()).padStart(2, '0');
    //    결과: "2025-09-15T18:00"
    const startAtString = `${year}-${month}-${day}T${selectedTime}:00`;
  
    const sendTimeString = `${dispatchDate}T${dispatchTime}:00`;

    const saveData: NewAnnouncement = {
    title,
    body: content, // content -> body
    fid: selectedFestivalId, // festivalId -> fid
    fname: selectedFestival?.fname || '',
    startAt: startAtString,
    sendTime: sendTimeString,
  };
  ("서버로 전송하는 데이터:", saveData); 

  if (editTarget) {
    // 수정일 경우, scheduleId를 포함한 완전한 객체를 onSave로 넘겨줘요.
    onSave({
      ...saveData,
      scheduleId: editTarget.scheduleId,
      sent: editTarget.sent, // sent 같은 기존 상태도 함께 넘겨줘야 해요.
    });
  } else {
    // 등록일 경우, NewAnnouncement 객체를 넘겨줘요.
    onSave(saveData);
  }

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
                                minDate={selectedFestival?.fdfrom}
                                maxDate={selectedFestival?.fdto}
                                availableDaysOfWeek={availableDaysOfWeek}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>공지 대상 시간</label>
                            <TimeSelector 
                                selectedTime={selectedTime} 
                                onTimeSelect={setSelectedTime}
                                availableTimes={availableTimes}
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
