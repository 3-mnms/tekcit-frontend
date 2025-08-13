import React, { useState, useEffect, useMemo } from "react";
import styles from "./Header.module.css";
import logo from "@shared/assets/logo.png";
import { IoLogOutOutline } from "react-icons/io5";

type JwtRole = "USER" | "HOST" | "ADMIN";
type JwtPayload = {
  sub: string;
  name: string;
  userId: number;
  role: JwtRole;
  exp?: number;
  iat?: number;
};

function readCookie(name: string): string | null {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] ?? null
  );
}

function setCookie(name: string, value: string, opts?: { maxAgeSec?: number }) {
  const isHttps = window.location.protocol === "https:";
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (opts?.maxAgeSec) parts.push(`Max-Age=${opts.maxAgeSec}`);
  if (isHttps) parts.push("Secure");
  document.cookie = parts.join("; ");
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0`;
}

function parseJwt<T extends object = Record<string, unknown>>(token: string): T | null {
  try {
    const [, part] = token.split(".");
    if (!part) return null;
    let b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = atob(b64);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

function remainingSecondsFromToken(token: string | null): number | null {
  if (!token) return null;
  const decoded = parseJwt<JwtPayload>(decodeURIComponent(token));
  if (!decoded?.exp) return null;
  const secs = Math.floor(decoded.exp * 1000 - Date.now()) / 1000;
  return Math.max(0, Math.floor(secs));
}

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

const MAX_UI_SEC = 60 * 60;

function getUiRemaining(): number {
  const token = readCookie("accessToken");
  const left = remainingSecondsFromToken(token) ?? MAX_UI_SEC;
  return Math.max(0, Math.min(left, MAX_UI_SEC));
}


const Header: React.FC<HeaderProps> = ({ userName, onLogout, ...props }) => {
  const initialLeft = useMemo(() => getUiRemaining(), []);

  const [timeLeft, setTimeLeft] = useState(initialLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeLeft(getUiRemaining());
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };
  const USER_ORIGIN = import.meta.env.VITE_USER_ORIGIN as string | undefined;
  const handleLogout = () => {
    deleteCookie("accessToken"); 
    onLogout();   
    const url = USER_ORIGIN ? `${USER_ORIGIN}/login` : `/login`;
  window.location.replace(url);
  };

  const extendSession = async () => {
    try {
      const current = readCookie("accessToken");
      if (!current) throw new Error("no token");
      setCookie("accessToken", decodeURIComponent(current), { maxAgeSec: 60 * 60 });
      setTimeLeft(MAX_UI_SEC);
    } catch {
      alert("세션 연장에 실패했습니다. 다시 로그인 해주세요.");
      handleLogout();
    }
  };

  const sessionTimeStyle =
    timeLeft <= 300 ? `${styles.sessionTime} ${styles.sessionTimeWarning}` : styles.sessionTime;

  return (
    <header className={styles.header} {...props}>
      <div className={styles.left}>
        <img src={logo} alt="tekcit logo" className={styles.logo} />
      </div>

      <div className={styles.right}>
        <span className={styles.userInfo}>
          <strong>{userName}</strong>님
        </span>
        <span className={styles.separator}>|</span>

        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutLink}
          title="로그아웃"
        >
          로그아웃 <IoLogOutOutline size={15} style={{ marginLeft: 2, verticalAlign: "middle" }} />
        </button>

        <span className={styles.separator}>|</span>
        <span className={sessionTimeStyle}>{formatTime(timeLeft)}</span>
        <span className={styles.separator}>|</span>

        <button type="button" onClick={extendSession} className={styles.extendButton}>
          시간 연장
        </button>
      </div>
    </header>
  );
};

export default Header;