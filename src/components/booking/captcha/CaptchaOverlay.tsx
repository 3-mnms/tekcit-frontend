import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './CaptchaOverlay.module.css';
import Button from '@/components/common/Button';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useCaptchaImageUrl,
  useVerifyCaptcha,
} from '@/models/captcha/tanstack-query/useCaptcha';
import type { ApiEnvelope, CaptchaResponseDTO } from '@/models/captcha/captchaTypes';

type Props = {
  /** 인증 성공 시 오버레이를 닫고 예매 페이지를 계속 진행 */
  onVerified: () => void;
  /** 실패/만료로 창을 닫을 때 호출(옵션) */
  onCloseWindow?: () => void;
  /** 만료 시간(초). 서버 기본이 3분이므로 180 */
  expireSeconds?: number;
};

const schema = z.object({
  captcha: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9]{5}$/, '영문/숫자 5자리로 입력해 주세요.'),
});
type FormValues = z.infer<typeof schema>;

const CaptchaOverlay: React.FC<Props> = ({
  onVerified,
  onCloseWindow,
  expireSeconds = 180,
}) => {
  const { url, refresh } = useCaptchaImageUrl();
  const { mutate: verify, isPending } = useVerifyCaptcha();

  const [serverMsg, setServerMsg] = useState('');
  const [left, setLeft] = useState(expireSeconds);

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  });

  // 새 이미지 받을 때마다 타이머 초기화
  useEffect(() => {
    setLeft(expireSeconds);
  }, [url, expireSeconds]);

  // 1초 타이머
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  // 만료 시 팝업 닫기
  useEffect(() => {
    if (left === 0) {
      // 안내를 잠깐 보여주고 닫아도 되고, 바로 닫아도 됨
      if (onCloseWindow) onCloseWindow();
      else window.close();
    }
  }, [left, onCloseWindow]);

  const mmss = useMemo(() => {
    const m = Math.floor(left / 60).toString().padStart(2, '0');
    const s = (left % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [left]);

  const onRefresh = async () => {
    setServerMsg('');
    resetField('captcha');
    await refresh(); // 타이머도 리셋됨
  };

  const onSubmit = (v: FormValues) => {
    setServerMsg('');
    verify(v.captcha.trim(), {
      onSuccess: (res: ApiEnvelope<CaptchaResponseDTO>) => {
        if (res.success && res.data?.success) {
          setServerMsg(res.data.message || '인증 성공!');
          onVerified();
        } else {
          // 실패: 서버 메시지 표시 + 자동 새 이미지
          const msg =
            (!res.success && res.message) ||
            res.data?.message ||
            '보안문자 인증에 실패했어요.';
          setServerMsg(msg);
          setError('captcha', { type: 'server', message: msg });

          // 요구사항: "틀리게 했으면 계속 새로운 이미지가 만들어져서"
          onRefresh();
        }
      },
      onError: () => {
        const msg = '네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
        setServerMsg(msg);
        setError('captcha', { type: 'server', message: msg });
      },
    });
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="보안문자 인증">
      <div className={styles.card}>
        <h2 className={styles.title}>보안문자 인증</h2>

        <div className={styles.row}>
          <div className={styles.imageBox} aria-live="polite">
            {url ? (
              <img src={url} className={styles.img} alt="보안문자 이미지" draggable={false} />
            ) : (
              <div className={styles.imgSkeleton} />
            )}
          </div>

          <div className={styles.side}>
            <p className={styles.desc}>
              화면의 <strong>영문/숫자 5자리</strong>를 입력해 주세요. (대·소문자 구분 없음)
            </p>

            <div className={styles.timerRow}>
              <span className={styles.timerLabel}>만료까지</span>
              <span className={styles.timerVal}>{mmss}</span>
              <Button type="button" onClick={onRefresh} className="ml-2 px-3 py-2 text-sm">
                새로고침
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <label htmlFor="captcha" className={styles.label}>
                보안문자 입력
              </label>
              <input
                id="captcha"
                type="text"
                inputMode="latin"
                autoComplete="off"
                maxLength={5}
                placeholder="ABCDE"
                className={styles.input}
                {...register('captcha')}
                onChange={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
              />
              {errors.captcha && <p className={styles.error}>{errors.captcha.message}</p>}

              {serverMsg && <p className={styles.serverMsg}>{serverMsg}</p>}

              <div className={styles.actions}>
                <Button type="submit" className="w-full py-3 text-base" disabled={isPending || left === 0}>
                  {isPending ? '확인 중…' : '인증하기'}
                </Button>
                <button type="button" className={styles.textBtn} onClick={onRefresh}>
                  이미지가 잘 안 보이나요? 새로 고침
                </button>
              </div>
            </form>
          </div>
        </div>

        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => {
            if (onCloseWindow) onCloseWindow();
            else window.close();
          }}
          aria-label="예매창 닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default CaptchaOverlay;
