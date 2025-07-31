import React from "react";
import styles from "./LoginInput.module.css";

const LoginInput: React.FC = () => {
  return (
    <div className={styles.container}>
      <input type="text" placeholder="아이디" className={styles.input} />
      <input type="password" placeholder="비밀번호" className={styles.input} />
    </div>
  );
};

export default LoginInput;
