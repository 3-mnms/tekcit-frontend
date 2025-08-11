// src/components/shared/ScheduleDropdown.tsx

import React, { useState } from 'react';
import styles from './ScheduleDropdown.module.css';
import Button from '@/components/common/Button';
import type { FestivalScheduleDTO } from '../../models/festival';

interface ScheduleDropdownProps {
    schedules: FestivalScheduleDTO[];
    onAddSchedule: (day: string, time: string) => void;
    onRemoveSchedule: (index: number) => void;
}

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIMES = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const ScheduleDropdown: React.FC<ScheduleDropdownProps> = ({ schedules, onAddSchedule, onRemoveSchedule }) => {
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const handleAdd = () => {
        if (selectedDay && selectedTime) {
            onAddSchedule(selectedDay, selectedTime);
            setSelectedDay('');
            setSelectedTime('');
        }
    };

    return (
        <div>
            <div className={styles.scheduleInputGroup}>
                <select
                    name="dayOfWeek"
                    className={styles.select}
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                >
                    <option value="">요일 선택</option>
                    {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                            {day}
                        </option>
                    ))}
                </select>
                <select
                    name="time"
                    className={styles.select}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                >
                    <option value="">시간 선택</option>
                    {TIMES.map((time) => (
                        <option key={time} value={time}>
                            {time}
                        </option>
                    ))}
                </select>
                <Button type="button" onClick={handleAdd} className={styles.addButton}>추가</Button>
            </div>

            {schedules.length > 0 && (
                <div className={styles.scheduleList}>
                    {schedules.map((schedule, index) => (
                        <div key={index} className={styles.scheduleTag}>
                            <span>{`${schedule.dayOfWeek} - ${schedule.time}`}</span>
                            <button
                                type="button"
                                onClick={() => onRemoveSchedule(index)}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScheduleDropdown;