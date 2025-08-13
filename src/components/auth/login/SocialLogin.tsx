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
      if (e.origin !== window.location.origin) return;
      if (!e.data) return;

      if (e.data.type === "kakao-auth") {
        const { status, ready } = e.data as { status: "existing" | "new"; ready?: boolean };

        if (status === "existing" && ready) {
          navigate("/login", { replace: true });
          try { popupRef.current?.close(); } catch {}
          if (pollTimer.current) window.clearInterval(pollTimer.current);
          return;
        }

        if (status === "new" && ready) {
          navigate("/auth/signup/kakao?provider=kakao", { replace: true });
          try { popupRef.current?.close(); } catch {}
          if (pollTimer.current) window.clearInterval(pollTimer.current);
          return;
        }
      }

      if (e.data.type === "kakao-signup-result") {
        const { ok, error } = e.data as { ok: boolean; error?: string };
        if (ok) {
          navigate("/login", { replace: true });
        } else {
          alert(error || "카카오 회원가입 실패");
        }
        try { popupRef.current?.close(); } catch {}
        if (pollTimer.current) window.clearInterval(pollTimer.current);
      }
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

    if (!popupRef.current) {
      window.location.href = "/api/auth/kakao/authorize";
      return;
    }

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