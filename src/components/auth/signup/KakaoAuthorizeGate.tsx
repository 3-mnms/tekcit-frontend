// src/pages/auth/kakao/KakaoAuthorizeGate.tsx
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSignupStore } from '@/shared/storage/useSignupStore';

const KakaoAuthorizeGate: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const setProvider = useSignupStore((s) => s.setProvider);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const provider = params.get('provider');
    if (provider !== 'kakao') {
      // 잘못 들어오면 일반 회원가입으로
      navigate('/auth/signup', { replace: true });
      return;
    }
    setProvider('kakao');
  }, [search, navigate, setProvider]);

  return <Outlet />;
};

export default KakaoAuthorizeGate;
