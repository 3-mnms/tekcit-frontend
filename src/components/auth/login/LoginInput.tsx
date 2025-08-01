// components/auth/login/LoginInput.tsx
import React from "react";
import styles from "./LoginInput.module.css";

interface LoginInputProps {
  inputs: {
    type: string;
    placeholder: string;
  }[];
}

const LoginInput: React.FC<LoginInputProps> = ({ inputs }) => {
  return (
    <div className={styles.container}>
      {inputs.map((input, index) => (
        <input
          key={index}
          type={input.type}
          placeholder={input.placeholder}
          className={styles.input}
        />
      ))}
    </div>
  );
};

export default LoginInput;
