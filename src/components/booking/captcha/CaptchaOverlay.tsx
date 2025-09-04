import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
    onVerified: () => void;
    onCloseWindow?: () => void;
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

    const formRef = useRef<HTMLFormElement>(null);
    const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

    const {
        register,
        handleSubmit,
        setError,
        resetField,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: 'onSubmit',
    });

    const captchaValue = (watch('captcha') || '').trim();                // ← 추가
    const isCaptchaReady = /^[A-Za-z0-9]{5}$/.test(captchaValue);        // ← 추가
    const canSubmit = !!url && !isPending && left > 0 && isCaptchaReady; // ← 추가

    // 새 이미지 로드마다 타이머 초기화
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
            if (onCloseWindow) onCloseWindow();
            else window.close();
        }
    }, [left, onCloseWindow]);

    const mmss = useMemo(() => {
        const m = Math.floor(left / 60).toString().padStart(2, '0');
        const s = (left % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }, [left]);

    const onRefresh = useCallback(async () => {
        setServerMsg('');
        resetField('captcha');
        await refresh();
    }, [refresh, resetField]);

    const onSubmit = (v: FormValues) => {
        setServerMsg('');
        verify(v.captcha.trim(), {
            onSuccess: (res: ApiEnvelope<CaptchaResponseDTO>) => {
                if (res.success && res.data?.success) {
                    setServerMsg(res.data.message || '인증 성공!');
                    onVerified();
                } else {
                    const msg =
                        (!res.success && res.message) ||
                        res.data?.message ||
                        '보안문자 인증에 실패했어요.';
                    setServerMsg(msg);
                    setError('captcha', { type: 'server', message: msg });
                    // 실패 시 새 이미지로 교체
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

                <div className={styles.column}>
                    {/* 이미지만(배경 박스 없음) */}
                    <div className={styles.imageOnly} aria-live="polite">
                        {url ? (
                            <img src={url} className={styles.img} alt="보안문자 이미지" draggable={false} />
                        ) : (
                            <div className={styles.imgSkeleton} />
                        )}
                    </div>

                    {/* 안내 문구 */}
                    <p className={styles.desc}>
                        화면의 <strong>영문/숫자 5자리</strong>를 입력해 주세요.
                    </p>

                    {/* 입력/버튼/에러 */}
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit(onSubmit)}
                        className={styles.form}
                    >
                        <label htmlFor="captcha" className={styles.label}>
                            보안문자 입력
                            <span className={styles.timer}>
                                <span className={styles.timerDot} aria-hidden>•</span>
                                만료까지 <span className={styles.timerVal}>{mmss}</span>
                            </span>
                        </label>

                        <input
                            id="captcha"
                            type="text"
                            inputMode="latin"
                            autoComplete="off"
                            maxLength={5}
                            placeholder="ABCDE"
                            className={styles.input}
                            autoFocus
                            {...register('captcha')}
                            onChange={(e) => {
                                e.currentTarget.value = e.currentTarget.value.toUpperCase();
                            }}
                            onKeyDown={(e) => {
                                const composing = (e.nativeEvent as any).isComposing;
                                if (e.key === 'Enter' && !composing) {
                                    e.preventDefault();
                                    if (!canSubmit) return; // ← 추가: 5자리 아니면 제출 안 함(에러 안 뜸)
                                    formRef.current?.requestSubmit(hiddenSubmitRef.current || undefined);
                                }
                            }}
                        />

                        {errors.captcha && <p className={styles.error}>{errors.captcha.message}</p>}
                        {serverMsg && <p className={styles.serverMsg}>{serverMsg}</p>}

                        <div className={styles.actions}>
                            <Button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={!canSubmit}   // ← 변경: 입력 5자리+이미지 로드+잔여시간>0일 때만 활성
                            >
                                {isPending ? '확인 중…' : '인증하기'}
                            </Button>

                            {/* 숨은 네이티브 submit → requestSubmit 대상 */}
                            <button
                                ref={hiddenSubmitRef}
                                type="submit"
                                className={styles.hiddenSubmit}
                                tabIndex={-1}
                                aria-hidden="true"
                            />

                            <button type="button" className={styles.textBtn} onClick={onRefresh}>
                                이미지가 잘 안 보이나요? 새로 고침
                            </button>
                        </div>
                    </form>
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
