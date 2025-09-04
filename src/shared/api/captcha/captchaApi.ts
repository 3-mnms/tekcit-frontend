// src/shared/api/captcha/captchaApi.ts
import { api } from '@/shared/config/axios'; // ← 프로젝트의 axios 인스턴스 경로에 맞춰주세요
import type { ApiEnvelope, CaptchaResponseDTO } from '@/models/captcha/captchaTypes';

/**
 * 캡차 이미지를 Blob으로 받습니다.
 * - 서버가 HttpServletResponse에 바로 이미지를 쓰기 때문에 responseType: 'blob' 필수
 * - 세션 쿠키가 필요할 수 있어 withCredentials 권장(프로젝트 axios가 이미 설정해둘 수도 있음)
 */
export const fetchCaptchaImageBlob = async (): Promise<Blob> => {
  const res = await api.get('/captcha/image', {
    responseType: 'blob',
    withCredentials: true,
    // 캐시 우회(필요시): params: { _ts: Date.now() }
  });
  return res.data as Blob;
};

/**
 * Blob을 Object URL로 변환해서 반환합니다.
 * - 사용 후 URL.revokeObjectURL로 해제 권장
 */
export const fetchCaptchaImageUrl = async (): Promise<string> => {
  const blob = await fetchCaptchaImageBlob();
  return URL.createObjectURL(blob);
};

/**
 * 캡차 검증
 * - Spring @RequestParam("captcha")이므로 params로 전달
 */
export const verifyCaptcha = async (
  captcha: string
): Promise<ApiEnvelope<CaptchaResponseDTO>> => {
  const res = await api.post<ApiEnvelope<CaptchaResponseDTO>>(
    '/captcha/verify',
    null,
    { params: { captcha } }
  );
  return res.data;
};
