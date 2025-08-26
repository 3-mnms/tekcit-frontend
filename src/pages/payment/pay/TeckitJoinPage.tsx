import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import styles from './TeckitJoinPage.module.css'

// ✅ 공용 axios 인스턴스(프로젝트 공통 api 인스턴스 사용)
import { api } from '@/shared/api/axios'

async function fetchMyProfile() {
  const { data } = await api.get('/api/users/me')
  // 기대되는 형태 예시: { name: '홍길동'}
  return data as { name?: string }
}

// ✅ 2) 테킷페이 계정 개설 API (JWT로 사용자 식별 가정)
//    - 서버 스펙에 맞춰 URL/바디 수정
async function createTeckitPayAccount(payload: {
  payPin: string // 6자리 숫자 문자열
  agree: boolean
}) {
  const { data } = await api.post('/api/teckitpay/accounts', payload)
  return data
}

// zod 유효성 검사
const joinSchema = z
  .object({
    payPin: z
      .string()
      .regex(/^\d{6}$/, '결제 PIN은 숫자 6자리여야 합니다'),
    payPinConfirm: z.string(),
    agree: z.boolean().refine(v => v === true, '약관에 동의해야 개설할 수 있습니다'),
  })
  // ✅ PIN 일치 확인(크로스 필드 검증)
  .refine((v) => v.payPin === v.payPinConfirm, {
    message: '결제 PIN이 일치하지 않습니다',
    path: ['payPinConfirm'],
  })

// ✅ 타입 자동 추론
type JoinFormValues = z.infer<typeof joinSchema>

export default function TeckitJoinPage() {
  const navigate = useNavigate()

  // ✅ 프로필 로드(로그인 검증 겸용)
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMyProfile,
    // 실패 시(401 등) 즉시 로그인 페이지로 보냄
    retry: false,
  })

  // 로그인 안되면 로그인 페이지로 이동
  useEffect(() => {
    if (profileQuery.isError) {
      // 상태코드 별 세분화가 필요하면 error 객체에서 response?.status 확인
      navigate('/auth/login', { replace: true, state: { redirectTo: '/auth/join' } })
    }
  }, [profileQuery.isError, navigate])

  // ✅ RHF: 초기값은 프로필 로드 후 주입
  const defaultValues = useMemo<Partial<JoinFormValues>>(
    () => ({
      payPin: '',
      payPinConfirm: '',
      agree: false,
    }),
    [profileQuery.data]
  )

  // 유효성 검사 해서 버튼 비활성화 제어
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    mode: 'onChange',
    defaultValues, // 최초 렌더 시 1차 설정
  })

  // ✅ 개설 요청 뮤테이션
  const createMutation = useMutation({
    mutationFn: createTeckitPayAccount,
    onSuccess: () => {
      // 계정 생성 성공 시 페이 내역 페이지로 이동
      navigate('/payment/wallet-point', { replace: true })
    },
  })

  // ✅ 제출 핸들러: 하이픈 제거 등 정규화 후 전송
  const onSubmit = (v: JoinFormValues) => {
    createMutation.mutate({
      payPin: v.payPin,
      agree: v.agree,
    })
  }

  // ✅ 로딩 상태 UI (프로필 불러오는 중)
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

  // ✅ 여기까지 도달했다면 로그인 상태 + 프로필 로딩 완료
  const name = profileQuery.data?.name ?? '사용자'

  return (
    <main className={styles.page}>
      {/* 상단 안내영역 */}
      <section className={styles.header}>
        <h1 className={styles.title}>테킷 페이 계정 개설</h1>
        <p className={styles.subtitle}>
          로그인한 계정으로 테킷 페이를 시작해보세요. 결제 PIN은 꼭 기억해두세요.
        </p>
      </section>

      {/* 카드 레이아웃 */}
      <section className={styles.card}>
        {/* 읽기 전용 프로필 정보 */}
        <div className={styles.profileBox}>
          {/* 이름 */}
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

          {/* 서버 에러 노출(간단 예시) */}
          {createMutation.isError && (
            <p className={styles.serverError}>
              계정 개설 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
          )}
        </form>
      </section>
    </main>
  )
}
