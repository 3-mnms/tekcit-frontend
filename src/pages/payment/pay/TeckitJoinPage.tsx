// src/pages/payment/TeckitJoinPage.tsx

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query' // 주석: useQuery 제거 멍
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './TeckitJoinPage.module.css'
import Header from '@/components/common/header/Header'
import Spinner from '@/components/common/spinner/Spinner'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import { CreateAccountRequestSchema, createTekcitPayAccount } from '@/shared/api/payment/join' // 주석: 계좌 생성 API 멍

/* ───────────────────────── 폼 스키마 ───────────────────────── */
// 주석: 화면 폼은 password 두 번 입력 + 약관 동의 멍
const joinSchema = z
  .object({
    payPin: z.string().regex(/^\d{6}$/, '결제 PIN은 숫자 6자리여야 합니다.'),
    payPinConfirm: z.string(),
    agree: z.boolean().refine((v) => v === true, '약관에 동의해야 개설할 수 있습니다.'),
  })
  .refine((v) => v.payPin === v.payPinConfirm, {
    message: '결제 PIN이 일치하지 않습니다.',
    path: ['payPinConfirm'],
  })

type JoinFormValues = z.infer<typeof joinSchema>

/* ───────────────────────── 컴포넌트 ───────────────────────── */
export default function TeckitJoinPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authReady, isLoggedIn, user } = useAuthStore() // 주석: 훅은 컴포넌트 내부에서만 호출 멍

  // ✅ 진입 가드 멍
  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [authReady, isLoggedIn, navigate, location.pathname])

  // 주석: 스토어 복원 전/비로그인 중엔 렌더 방지 멍
  if (!authReady || !isLoggedIn) return null

  // 🔹 표시용 이름: 스토어 기반(없으면 '사용자') 멍
  const displayName = user?.name ?? '사용자'

  const defaultValues = useMemo<Partial<JoinFormValues>>(
    () => ({ payPin: '', payPinConfirm: '', agree: false }),
    [],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    mode: 'onChange',
    defaultValues,
  })

  // ✅ 계좌 개설 뮤테이션 — Join.ts 사용 멍
  const createMutation = useMutation({
    mutationFn: async (payload: { payPin: string; agree: boolean }) => {
      // 주석: API 스펙에 맞춰 { password: string }으로 전달 멍
      const requestBody = CreateAccountRequestSchema.parse({
        password: payload.payPin,
      })
      await createTekcitPayAccount(requestBody) // 주석: X-User-Id는 인터셉터에서 부착 멍
    },
    onSuccess: () => {
      navigate('/payment/wallet-point', { replace: true })
    },
  })

  // 🔹 제출 핸들러 멍
  const onSubmit = (v: JoinFormValues) => {
    createMutation.mutate({ payPin: v.payPin, agree: v.agree })
  }

  return (
    <>
      <Header />
      <main className={styles.page}>
        {/* 상단 안내 — 대표색(#4D9AFD)은 CSS에서 처리 가정 멍 */}
        <section className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>테킷 페이 계정 개설</h1>
            <span className={styles.badge}>TECKIT PAY</span>
          </div>
          <p className={styles.subtitle}>
            결제 PIN은 꼭 기억해 두세요. 분실 시 본인 확인 절차가 필요할 수 있어요.
          </p>
        </section>

        {/* 카드 레이아웃 멍 */}
        <section className={styles.card}>
          {/* 읽기 전용 프로필 박스 멍 */}
          <div className={styles.profileBox}>
            <div className={styles.pair}>
              <span className={styles.pairKey}>이름</span>
              <span className={styles.pairVal}>{displayName}</span>
            </div>
          </div>
          <hr className={styles.divider} />

          {/* 개설 폼 멍 */}
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* 결제 PIN */}
            <div className={styles.field}>
              <label htmlFor="payPin" className={styles.label}>
                결제 PIN(6자리)
              </label>
              <input
                id="payPin"
                type="password"
                className={styles.input}
                placeholder="숫자 6자리"
                {...register('payPin')}
                aria-invalid={!!errors.payPin}
                autoComplete="new-password"
                inputMode="numeric"
                maxLength={6}
              />
              {errors.payPin && <p className={styles.error}>{errors.payPin.message}</p>}
            </div>

            {/* 결제 PIN 확인 */}
            <div className={styles.field}>
              <label htmlFor="payPinConfirm" className={styles.label}>
                결제 PIN 확인
              </label>
              <input
                id="payPinConfirm"
                type="password"
                className={styles.input}
                placeholder="한 번 더 입력"
                {...register('payPinConfirm')}
                aria-invalid={!!errors.payPinConfirm}
                autoComplete="new-password"
                inputMode="numeric"
                maxLength={6}
              />
              {errors.payPinConfirm && (
                <p className={styles.error}>{errors.payPinConfirm.message}</p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className={styles.agreeRow}>
              <input
                id="agree"
                type="checkbox"
                className={styles.checkbox}
                {...register('agree')}
              />
              <label htmlFor="agree" className={styles.agreeLabel}>
                (필수) 테킷 페이 서비스 이용약관 및 개인정보 처리방침에 동의합니다
              </label>
            </div>
            {errors.agree && <p className={styles.error}>{errors.agree.message}</p>}

            {/* 액션 영역 */}
            {createMutation.isPending && <Spinner />}
            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={!isValid || isSubmitting || createMutation.isPending}
                aria-busy={isSubmitting || createMutation.isPending}
              >
                {createMutation.isPending ? '계정 개설하기' : '계정 개설하기'}
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)}>
                이전으로
              </button>
            </div>

            {/* 서버 에러 노출(401/409/기타) */}
            {createMutation.isError && (
              <p className={styles.serverError}>
                {(createMutation.error as any)?.response?.status === 401
                  ? '세션이 만료되었어요. 다시 로그인해 주세요.'
                  : (createMutation.error as any)?.response?.status === 409
                    ? '이미 테킷 페이 계정이 존재합니다.'
                    : '계정 개설 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
              </p>
            )}
          </form>
        </section>
      </main>
    </>
  )
}
