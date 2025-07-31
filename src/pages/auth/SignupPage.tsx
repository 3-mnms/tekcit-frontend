// pages/SignupPage.tsx
import React from "react";
import Logo from "@assets/logo.png";
import SignupInputFields from "@/components/auth/signup/SignupInputFields";
import Button from "@/components/common/button/Button";
import styles from "./SignupPage.module.css";

const SignupPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>회원가입</h2>

        <SignupInputFields />

        <Button className="w-full h-12 mt-4">가입하기</Button>
      </div>
    </div>
  );
};

export default SignupPage;
