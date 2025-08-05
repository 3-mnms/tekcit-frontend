// components/festival/FestivalScheduleSection.tsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { isSameDay } from 'date-fns';
import ko from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './FestivalScheduleSection.module.css';

// 더미 데이터
const availableDates = [
  new Date(2026, 8, 12),
  new Date(2026, 8, 18),
  new Date(2026, 9, 2),
  new Date(2026, 9, 5),
];

const timeTableByDate: { [key: string]: string[] } = {
  '2026-09-12': ['14:00', '18:00'],
  '2026-09-18': ['15:00'],
  '2026-10-02': ['12:00', '17:30'],
  '2026-10-05': ['13:00'],
};

const minDate = new Date(2026, 8, 1);
const maxDate = new Date(2026, 9, 31);

const FestivalScheduleSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const formatDateKey = (date: Date | null) =>
    date?.toISOString().slice(0, 10) || '';

  const availableTimes = timeTableByDate[formatDateKey(selectedDate)] || [];

  return (
    <div className={styles.container}>
      {/* 관람일 */}
      <p className={styles.title}>관람일</p>
      <div className={styles.datepickerWrapper}>
      <DatePicker
        inline
        locale={ko}
        selected={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          setSelectedTime(null); // 날짜 바뀌면 시간 초기화
        }}
        minDate={minDate}
        maxDate={maxDate}
        includeDates={availableDates}
        dateFormat="yyyy.MM.dd"
        renderDayContents={(day, date) => {
          const isAvailable = availableDates.some((d) => isSameDay(d, date));
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          return (
            <div
              className={`${styles.day} ${isAvailable ? styles.active : styles.inactive} ${
                isSelected ? styles.selected : ''
              }`}
            >
              {day}
            </div>
          );
        }}
      />
      </div>

      {/* 시간 */}
      <div className={styles.section}>
        <p className={styles.label}>시간</p>
        <div className={styles.timeGroup}>
          {availableTimes.map((time) => (
            <button
              key={time}
              className={`${styles.timeBtn} ${selectedTime === time ? styles.selectedBtn : ''}`}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* 가격 + 확인 */}
      <div className={styles.section}>
        <div className={styles.priceRow}>
          <span className={styles.price}>₩49,000</span>
          <button
            className={styles.confirmBtn}
            disabled={!selectedDate || !selectedTime}
            onClick={() =>
              alert(`${formatDateKey(selectedDate)} ${selectedTime} 예매 시작!`)
            }
          >
            예매하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FestivalScheduleSection;
