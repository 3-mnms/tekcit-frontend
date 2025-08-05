import React from 'react';
import styles from './Input.module.css';

interface FormInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  label?: string;
  options?: string[]; // select용
  disabled?: boolean;
  className?: string;
  rightElement?: React.ReactNode; 
}

const Input: React.FC<FormInputProps> = ({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  label,
  options,
  disabled = false,
  className = '',
  rightElement,
}) => {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}

      {type === 'select' && options ? (
        <select
          defaultValue={defaultValue}
          onChange={onChange}
          className={`${styles.input} ${className}`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : rightElement ? (
        <div className={styles.row}>
          <input
            type={type}
            value={value}
            disabled={disabled}
            className={`${styles.input}`}
          />
          {rightElement}
        </div>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          className={`${styles.input} ${className}`}
        />
      )}
    </div>
  );
};

export default Input;