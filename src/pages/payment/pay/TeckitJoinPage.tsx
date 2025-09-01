// src/pages/payment/TeckitJoinPage.tsx
// ✅ 테킷 페이 계좌 개설 페이지 (로그인 필수 + 백엔드 스펙 맞춤) 멍
//    - 진입 가드: 로그인 안 되어 있으면 /login 으로 이동
//    - 프로필은 로그인 전제에서만 조회(401 나오면 로그인 만료로 간주 → /login)
//    - 계좌 개설 API: POST /tekcitpay/create-account (Body=Long JSON, Header=X-User-Id)
//    - axios 인터셉터에서 Authorization, X-User-Id 자동 부착된다고 가정

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './TeckitJoinPage.module.css'

import { api } from '@/shared/config/axios'
import { useAuthStore } from '@/shared/storage/useAuthStore'

// 🔹 프로필 조회: 로그인 전제. 401이면 토큰 만료/미로그인으로 보고 리다이렉트 멍
async function fetchMyProfile() {
  // 주석: baseURL이 http://localhost:10000/api 라면, 여기엔 /api를 다시 붙이지 않습니다 멍
  const { data } = await api.get('/users/me')
  // 주석: 응답 예시 { name: '홍길동' } 형태를 기대 멍
  return data as { name?: string }
}

// 🔹 계좌 개설 API: 서버는 Long(JSON number)을 기대하므로 숫자 전송 멍
async function createTeckitPayAccountByPin(pin: string) {
  const numericPin = Number(pin) // 주석: 문자열 → 숫자 변환 (문자열로 보내면 400 가능) 멍
  const { data } = await api.post('/tekcitpay/create-account', numericPin, {
    headers: { 'Content-Type': 'application/json' }, // 주석: 숫자를 JSON number로 전송 멍
  })
  return data
}

// 🔹 폼 검증 스키마: 숫자 6자리 + 일치 검사 + 약관 동의 멍
const joinSchema = z
  .object({
    payPin: z.string().regex(/^\d{6}$/, '결제 PIN은 숫자 6자리여야 합니다'),
    payPinConfirm: z.string(),
    agree: z.boolean().refine((v) => v === true, '약관에 동의해야 개설할 수 있습니다'),
  })
  .refine((v) => v.payPin === v.payPinConfirm, {
    message: '결제 PIN이 일치하지 않습니다',
    path: ['payPinConfirm'],
  })

type JoinFormValues = z.infer<typeof joinSchema>

export default function TeckitJoinPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { authReady, isLoggedIn } = useAuthStore()

  // ✅ 1) 라우트 가드: 스토어 복원 후 비로그인 → /login 으로 이동 멍
  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn) {
      // 주석: from에 현재 페이지를 넣어 로그인 후 돌아올 수 있게 함 멍
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [authReady, isLoggedIn, navigate, location.pathname])

  // 주석: 스토어 복원 전/비로그인 중엔 렌더 방지 (깜빡임 최소화) 멍
  if (!authReady || !isLoggedIn) return null

  // ✅ 2) 로그인 전제에서 프로필 가져오기 (401이면 로그인 만료로 보고 /login) 멍
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMyProfile,
    retry: false,
  })

  useEffect(() => {
    // 주석: 인증 만료 등으로 401이 떨어졌다면 로그인 페이지로 이동 멍
    const status = (profileQuery.error as any)?.response?.status
    if (status === 401) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [profileQuery.error, navigate, location.pathname])

  // 🔹 RHF 초기값 (프로필과 무관, 단순 폼 값) 멍
  const defaultValues = useMemo<Partial<JoinFormValues>>(
    () => ({
      payPin: '',
      payPinConfirm: '',
      agree: false,
    }),
    []
  )

  // 🔹 RHF 훅 셋업 멍
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    mode: 'onChange',
    defaultValues,
  })

  // ✅ 3) 계좌 개설 뮤테이션: 409(이미 있음), 기타 에러 분기 멍
  const createMutation = useMutation({
    mutationFn: async (payload: { payPin: string; agree: boolean }) => {
      // 주석: 서버는 PIN만 필요(약관은 프론트에서 이미 검증). 필요 시 서버에도 agree 전달로 변경 가능 멍
      return createTeckitPayAccountByPin(payload.payPin)
    },
    onSuccess: () => {
      // 주석: 성공 시 지갑/포인트 화면으로 이동 (경로는 프로젝트 정책에 맞게 수정 가능) 멍
      navigate('/payment/wallet-point', { replace: true })
    },
  })

  // 🔹 표시용 이름: 로그인 전제라 에러가 아니면 서버 값, 로딩/오류면 임시 표기 멍
  const displayName =
    (profileQuery.isSuccess && (profileQuery.data?.name || '사용자')) ||
    '사용자'

  // 🔹 프로필 로딩 스켈레톤 (UX용): 오래 걸리지 않는다면 바로 폼을 보여줘도 무방 멍
  if (profileQuery.isLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.header}>
          <h1 className={styles.title}>테킷 페이 계정 개설</h1>
          <p className={styles.subtitle}>사용자 정보를 불러오는 중...</p>
        </section>
        <section className={styles.card}><div className={styles.skeleton} /></section>
      </main>
    )
  }

  // 🔹 제출 핸들러 멍
  const onSubmit = (v: JoinFormValues) => {
    createMutation.mutate({ payPin: v.payPin, agree: v.agree })
  }

  return (
    <main className={styles.page}>
      {/* 상단 안내 영역 — 대표색 포인트는 CSS에서 #4D9AFD로 스타일링 가정 멍 */}
      <section className={styles.header}>
        <h1 className={styles.title}>테킷 페이 계정 개설</h1>
        <p className={styles.subtitle}>
          결제 PIN은 꼭 기억해두세요. 분실 시 본인 확인 절차가 필요할 수 있어요.
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

        {/* 개설 폼 멍 */}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* 결제 PIN */}
          <div className={styles.field}>
            <label htmlFor="payPin" className={styles.label}>결제 PIN(6자리)</label>
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
            <label htmlFor="payPinConfirm" className={styles.label}>결제 PIN 확인</label>
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
            <input id="agree" type="checkbox" className={styles.checkbox} {...register('agree')} />
            <label htmlFor="agree" className={styles.agreeLabel}>
              (필수) 테킷 페이 서비스 이용약관 및 개인정보 처리방침에 동의합니다
            </label>
          </div>
          {errors.agree && <p className={styles.error}>{errors.agree.message}</p>}

          {/* 액션 영역 */}
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!isValid || isSubmitting || createMutation.isPending}
              aria-busy={isSubmitting || createMutation.isPending}
            >
              {createMutation.isPending ? '개설 중...' : '계정 개설하기'}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate(-1)}
            >
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
  )
}
