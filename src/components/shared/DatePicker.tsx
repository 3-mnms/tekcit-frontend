// src/components/shared/DatePicker.tsx
import React from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, ...props }) => {
    return (
        <div className={styles.datePickerGroup}>
            {label && <label className={styles.label}>{label}</label>}
            <input type="date" className={styles.datePicker} {...props} />
        </div>
    );
};

export default DatePicker;