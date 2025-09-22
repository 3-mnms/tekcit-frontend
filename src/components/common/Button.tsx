import React from 'react';
import styles from './Button.module.css';

// 버튼 스타일 옵션 타입 정의
type ButtonVariant = 'primary' | 'secondary' | 'cancel' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;   
  className?: string; // 너비/높이 tailwind로 조정 가능
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
 const variantClassMap = {
    primary: styles.primary,
    secondary: styles.secondary,
    cancel: styles.cancel,
    danger: styles.danger,
  };

  return (
    <button
      className={`${styles.base} ${variantClassMap[variant]} ${className}`}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

// <Button variant="danger" className="w-full h-12">삭제 버튼</Button>

export default Button;
