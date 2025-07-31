// components/signup/SignupInputFields.tsx
import React from "react";
import styles from "./SignupInputFields.module.css";
import Button from "@/components/common/button/Button";

const SignupInputFields: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <input type="text" placeholder="아이디" className={styles.input} />
        <Button className="w-[95px] text-sm ml-1">중복 확인</Button>
      </div>

      <div className={styles.row}>
        <input type="password" placeholder="비밀번호" className={styles.inputFull} />
      </div>

      <div className={styles.row}>
        <input type="password" placeholder="비밀번호 확인" className={styles.inputFull} />
      </div>

      <div className={styles.row}>
        <input type="text" placeholder="주소" className={styles.input} />
        <Button className="w-[95px] text-sm ml-1">주소 찾기</Button>
      </div>

      <div className={styles.row}>
        <input type="text" placeholder="상세주소 입력" className={styles.inputFull} />
      </div>
    </div>
  );
};

export default SignupInputFields;