import React from "react";
import styles from "./SocialLogin.module.css";
import KaKao from "@assets/kakao.png";

const SocialLogin: React.FC = () => {
  return (
    <div className={styles.container}>
      <button className={styles.snsButton}>
        <img src={KaKao} alt="kakao" className={styles.icon} />
        카카오로 시작하기
      </button>
      {/* <button className={styles.snsButton}>네이버로 시작하기</button>
      <button className={styles.snsButton}>구글로 시작하기</button> */}
    </div>
  );
};

export default SocialLogin;
