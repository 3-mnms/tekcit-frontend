// SocialLogin.tsx
import React, { useEffect, useRef } from "react";
import styles from "./SocialLogin.module.css";
import KaKao from "@assets/kakao.png";
import { useNavigate } from "react-router-dom";

const POPUP_NAME = "kakaoPopup";

const SocialLogin: React.FC = () => {
  const navigate = useNavigate();
  const popupRef = useRef<Window | null>(null);
  const pollTimer = useRef<number | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // 보안: 동일 오리진만 처리
      if (e.origin !== window.location.origin) return;
      if (!e.data || e.data.type !== "kakao-auth") return;

      // 결과에 따라 라우팅
      if (e.data.status === "existing") {
        navigate("/login", { replace: true });
      } else if (e.data.status === "new") {
        navigate("/auth/signup/kakao?provider=kakao", { replace: true });
      }

      // 팝업 정리
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
      if (pollTimer.current) window.clearInterval(pollTimer.current);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  const handleKakaoLogin = () => {
    const w = 520;
    const h = 680;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;

    popupRef.current = window.open(
      "/api/auth/kakao/authorize",
      POPUP_NAME,
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    // 팝업이 차단되면 새창 이동으로 폴백
    if (!popupRef.current) {
      window.location.href = "/api/auth/kakao/authorize";
      return;
    }

    // 사용자가 팝업 닫았는지 감시 (메시지 못받고 종료될 때 대비)
    pollTimer.current = window.setInterval(() => {
      if (!popupRef.current || popupRef.current.closed) {
        window.clearInterval(pollTimer.current!);
      }
    }, 500);
  };

  return (
    <div className={styles.container}>
      <button className={styles.snsButton} onClick={handleKakaoLogin}>
        <img src={KaKao} alt="kakao" className={styles.icon} />
        카카오로 시작하기
      </button>
    </div>
  );
};

export default SocialLogin;
