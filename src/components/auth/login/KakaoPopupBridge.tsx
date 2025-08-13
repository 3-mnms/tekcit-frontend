import { useEffect } from "react";

// result: 팝업이 도달한 최종 상태
// - "new": 신규 유저 플로우 (우리 Step2/3 필요)
// - "existing": 기존 회원 플로우 (로그인 화면으로 안내)
export default function KakaoPopupBridge({ result }: { result: "existing" | "new" }) {
  useEffect(() => {
    const opener = window.opener;

    if (!opener || opener.closed) return;

    // 1) 팝업 준비 완료 신호 보내기 (메인창이 라우팅/대기)
    opener.postMessage(
      { type: "kakao-auth", status: result, ready: true },
      window.location.origin
    );

    // 2) 메인창에서 가입 DTO를 전달하면, 팝업이 직접 백엔드에 POST
    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (!e.data || e.data.type !== "kakao-signup") return;

      try {
        const res = await fetch("/api/auth/kakao/signupUser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // ✅ 팝업(8080) 쿠키 포함
          body: JSON.stringify(e.data.body),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          opener.postMessage(
            { type: "kakao-signup-result", ok: false, error: txt || `HTTP ${res.status}` },
            window.location.origin
          );
          return;
        }
        opener.postMessage(
          { type: "kakao-signup-result", ok: true },
          window.location.origin
        );
        // 성공/실패 통보 뒤 팝업 닫기(약간의 딜레이)
        setTimeout(() => window.close(), 120);
      } catch (err: any) {
        opener.postMessage(
          { type: "kakao-signup-result", ok: false, error: err?.message },
          window.location.origin
        );
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [result]);

  return null;
}