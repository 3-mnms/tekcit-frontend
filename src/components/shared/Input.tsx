import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    suffixText?: string;
}

const Input: React.FC<InputProps> = ({ suffixText, ...props }) => {
    return (
        <div className={styles.inputGroup}>
            <input className={styles.input} {...props} />
            {suffixText && <p className={styles.suffix}>{suffixText}</p>}
        </div>
    );
};

export default Input;