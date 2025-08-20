// FindIdPage.tsx
import React, { useState } from 'react'
import { FaRegCopy } from 'react-icons/fa6'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import styles from './FindIdPage.module.css'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { findIdSchema, type FindIdForm } from '@/models/auth/schema/findSchema'
import { useFindLoginIdMutation } from '@/models/auth/tanstack-query/useFindLoginInfo'

const FindIdPage: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null)
  const [foundId, setFoundId] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FindIdForm>({
    resolver: zodResolver(findIdSchema),
    mode: 'onChange',
  })

  const mut = useFindLoginIdMutation()

  const onSubmit = (form: FindIdForm) => {
    setCopied(false)
    setNotFoundMsg(null)
    setFoundId(null)

    mut.mutate(
      { name: form.name, email: form.email },
      {
        onSuccess: (loginId) => {
          if (loginId) setFoundId(loginId)
          else setNotFoundMsg('일치하는 정보가 없습니다.')
        },
        onError: () => setNotFoundMsg('일치하는 정보가 없습니다.'),
      },
    )
  }

  const handleCopy = async () => {
    if (!foundId) return
    await navigator.clipboard.writeText(foundId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleGoToLogin = () => {
    window.location.href = '/login'
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>아이디 찾기</h2>

        {/* ✅ foundId 유무로 화면 전환 */}
        {!foundId ? (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.field}>
                <input
                  type="text"
                  placeholder="이름"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                  className={styles.input}
                />
                {errors.name && <p className={styles.error}>{errors.name.message}</p>}
              </div>

              <div className={styles.field}>
                <input
                  type="email"
                  placeholder="이메일"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                  className={styles.input}
                />
                {errors.email && <p className={styles.error}>{errors.email.message}</p>}
              </div>

              {/* 하단 고정: 아이디 찾기 버튼 */}
              <div className={styles.actions}>
                <Button type="submit" className="w-full h-11" disabled={!isValid || mut.isPending}>
                  {mut.isPending ? '조회 중…' : '아이디 찾기'}
                </Button>
              </div>
            </form>

            {/* 서버에서 못 찾았을 때 */}
            {notFoundMsg && <p className={styles.error}>{notFoundMsg}</p>}
          </>
        ) : (
          <>
            {/* ✅ 아이디만 표시 */}
            <div className={styles.resultRow}>
              <input
                type="text"
                className={styles.resultInput}
                value={foundId}
                readOnly
                aria-label="찾은 아이디"
              />
              <button onClick={handleCopy} className={styles.copyButton} aria-label="아이디 복사">
                <FaRegCopy />
              </button>
            </div>
            {copied && <p className={styles.copied}>아이디가 복사되었습니다.</p>}

            {/* 하단 고정: 로그인 버튼만 */}
            <div className={styles.actions}>
              <Button onClick={handleGoToLogin} className="w-full h-11">
                로그인 하기
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FindIdPage
