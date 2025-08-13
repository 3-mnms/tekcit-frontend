// src/components/auth/kakao/KakaoPopupBridge.tsx
import { useEffect } from "react";

type Props = { result: "existing" | "new" };

export default function KakaoPopupBridge({ result }: Props) {
  useEffect(() => {
    // 팝업에서만 동작
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        { type: "kakao-auth", status: result },
        window.location.origin
      );
      // 살짝 딜레이 후 닫기 (메시지 전달 보장)
      setTimeout(() => window.close(), 100);
    }
  }, [result]);

  return null;
}
