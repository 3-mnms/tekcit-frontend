// src/components/auth/login/KakaoPopupBridge.tsx
import React, { useEffect } from 'react';

type BridgeStatus = 'existing' | 'new';

interface Props {
  status: BridgeStatus;
}

const KakaoPopupBridge: React.FC<Props> = ({ status }) => {
  useEffect(() => {
    try {
      // ✅ 오프너에게 보낼 신호를 localStorage에 기록
      //    (오프너는 storage 이벤트를 통해 감지)
      localStorage.setItem(
        'kakao_auth_done',
        JSON.stringify({ status, ts: Date.now() })
      );
    } finally {
      // 팝업 종료
      setTimeout(() => {
        window.close();
      }, 50);
    }
  }, [status]);

  return null;
};

export default KakaoPopupBridge;