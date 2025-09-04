// src/models/captcha/tanstack-query/useCaptcha.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCaptchaImageBlob, fetchCaptchaImageUrl, verifyCaptcha } from '@/shared/api/captcha/captchaApi';
import type { ApiEnvelope, CaptchaResponseDTO } from '@/models/captcha/captchaTypes';

/**
 * 캡차 이미지: Blob으로 다루는 Query 훅
 * - refetch할 때마다 새 이미지를 불러옵니다.
 * - UI에서는 URL.createObjectURL로 표시하거나, 아래 useCaptchaImageUrl 훅을 사용하세요.
 */
export const useCaptchaImageQuery = () => {
  return useQuery({
    queryKey: ['captcha', 'image', 'blob'],
    queryFn: fetchCaptchaImageBlob,
    // 이미지 캐시는 사실상 의미 없어 즉시 갱신을 선호하면 staleTime: 0
    staleTime: 0,
  });
};

/**
 * 캡차 이미지: Object URL로 다루는 편의 훅
 * - 내부에서 URL.createObjectURL/URL.revokeObjectURL 처리
 * - refresh()로 즉시 갱신
 */
export const useCaptchaImageUrl = () => {
  const [url, setUrl] = useState<string>('');
  const prevUrlRef = useRef<string>('');

  const revokePrev = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = '';
    }
  }, []);

  const refresh = useCallback(async () => {
    revokePrev();
    const next = await fetchCaptchaImageUrl();
    prevUrlRef.current = next;
    setUrl(next);
  }, [revokePrev]);

  useEffect(() => {
    // 첫 로드
    refresh();
    return () => revokePrev();
  }, [refresh, revokePrev]);

  return { url, refresh };
};

/**
 * 캡차 검증 Mutation
 * - 성공/실패 모두 ApiEnvelope으로 반환
 * - 성공 시 서버 세션에 '인증됨' 상태가 기록되었다고 가정(백엔드 로직)
 */
export const useVerifyCaptcha = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (captcha: string) => verifyCaptcha(captcha),
    onSuccess: (res: ApiEnvelope<CaptchaResponseDTO>) => {
      // 필요 시 관련 캐시 무효화(예: 인증 상태 키 등)
      // qc.invalidateQueries({ queryKey: ['captcha', 'status'] });
    },
  });
};
