import React from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './LoginInput.module.css';

interface Field extends InputHTMLAttributes<HTMLInputElement> {
  name: 'loginId' | 'loginPw';
  label?: string;
  error?: string;
  register?: ReturnType<any>;
}

interface LoginInputProps {
  inputs: Field[];
}

const LoginInput: React.FC<LoginInputProps> = ({ inputs }) => {
  return (
    <div className={styles.container}>
      {inputs.map(({ name, label, error, register, ...rest }, idx) => (
        <div key={idx} className={styles.field}>
          {label && <label className={styles.label} htmlFor={name}>{label}</label>}
          <input
            id={name}
            className={`${styles.input} ${error ? styles.invalid : ''}`}
            {...register}
            {...rest}
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>
      ))}
    </div>
  );
};

export default LoginInput;