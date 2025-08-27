// ✅ TeckitJoinPage.tsx — 로그인 없이도 진입 가능하게 수정 (리다이렉트 제거)
//    - 프로필 호출 실패 → 게스트 모드로 표시
//    - 제출 시 401이면 에러 메시지 노출만 하고 페이지 유지

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import styles from './TeckitJoinPage.module.css'

import { api } from '@/shared/config/axios'

// ✅ 내 프로필 조회 (로그인 안 되어 있으면 401 날 수 있음)
async function fetchMyProfile() {
  const { data } = await api.get('/api/users/me')
  // 기대되는 형태 예시: { name: '홍길동' }
  return data as { name?: string }
}

// ✅ 테킷페이 계정 개설 API
async function createTeckitPayAccount(payload: {
  payPin: string // 6자리 숫자 문자열
  agree: boolean
}) {
  const { data } = await api.post('/api/teckitpay/accounts', payload)
  return data
}

// ✅ zod 유효성 검사 스키마 (PIN 일치 포함)
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

// ✅ 타입 자동 추론
type JoinFormValues = z.infer<typeof joinSchema>

export default function TeckitJoinPage() {
  const navigate = useNavigate()

  // ✅ 프로필 로드 (실패해도 리다이렉트하지 않음! → 게스트 모드로 폴백)
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMyProfile,
    retry: false, // 401 등 실패 시 재시도 X (게스트 모드 바로 전환)
  })

  // ✅ RHF 초기값 (프로필 여부와 무관)
  const defaultValues = useMemo<Partial<JoinFormValues>>(
    () => ({
      payPin: '',
      payPinConfirm: '',
      agree: false,
    }),
    [profileQuery.data]
  )

  // ✅ RHF 훅
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    mode: 'onChange',
    defaultValues,
  })

  // ✅ 개설 뮤테이션 (401 등 에러는 화면에 안내만)
  const createMutation = useMutation({
    mutationFn: createTeckitPayAccount,
    onSuccess: () => {
      // 성공 시 지갑 포인트 페이지로 이동
      navigate('/payment/wallet-point', { replace: true })
    },
  })

  // ✅ 표시용 이름: 로그인 실패(또는 미로그인) 시 "게스트"로 폴백
  const name =
    (profileQuery.isSuccess && (profileQuery.data?.name || '사용자')) ||
    (profileQuery.isError ? '게스트' : '사용자') // 로딩 중이면 임시 '사용자'

  // ✅ 로딩 상태 UI (선호에 따라 바로 폼을 보여줘도 됨)
  //    - "로그인 안 해도 들어가게" 조건만 보면, 로딩 중에도 바로 폼 렌더 가능
  //    - 여기선 기존 UX 유지: 짧은 스켈레톤 후 폼 렌더
  if (profileQuery.isLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.header}>
          <h1 className={styles.title}>테킷 페이 계정 개설</h1>
          <p className={styles.subtitle}>사용자 정보를 확인하는 중...</p>
        </section>
        <section className={styles.card}><div className={styles.skeleton} /></section>
      </main>
    )
  }

  // ✅ 제출 핸들러
  const onSubmit = (v: JoinFormValues) => {
    // 주의: 미로그인 상태라면 서버가 401을 응답할 수 있음
    // → 아래 createMutation.isError 블록에서 사용자에게 안내
    createMutation.mutate({
      payPin: v.payPin,
      agree: v.agree,
    })
  }

  return (
    <main className={styles.page}>
      {/* 상단 안내영역 */}
      <section className={styles.header}>
        <h1 className={styles.title}>테킷 페이 계정 개설</h1>
        <p className={styles.subtitle}>
          {profileQuery.isError
            ? '로그인 없이 게스트로 진행 중입니다. 일부 기능이 제한될 수 있어요.'
            : '로그인한 계정으로 테킷 페이를 시작해보세요. 결제 PIN은 꼭 기억해두세요.'}
        </p>
      </section>

      {/* 카드 레이아웃 */}
      <section className={styles.card}>
        {/* 읽기 전용 프로필 정보 */}
        <div className={styles.profileBox}>
          {/* 이름 (게스트 가능) */}
          <div className={styles.pair}>
            <span className={styles.pairKey}>이름</span>
            <span className={styles.pairVal}>{name}</span>
          </div>
        </div>

        {/* 개설 폼 */}
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
              // ✅ 로그인 여부와 무관하게 제출 가능 (서버가 권한 체크)
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

          {/* 서버 에러 노출(401 등) */}
          {createMutation.isError && (
            <p className={styles.serverError}>
              {/* ✅ 401이면 로그인 필요 문구를 좀 더 친절히 안내 */}
              {(createMutation.error as any)?.response?.status === 401
                ? '로그인이 필요합니다. 상단 메뉴에서 로그인 후 다시 시도해주세요.'
                : '계정 개설 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

