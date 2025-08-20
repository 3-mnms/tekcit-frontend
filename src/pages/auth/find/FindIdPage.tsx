import React, { useState } from 'react'
import { FaRegCopy } from 'react-icons/fa6'
import Logo from '@assets/logo.png'
import Button from '@/components/common/button/Button'
import styles from './FindIdPage.module.css'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { findIdSchema, type FindIdForm } from '@/models/auth/schema/findIdSchema'
import { useFindLoginIdMutation } from '@/models/auth/tanstack-query/useFindLoginId'

const FindIdPage: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const [notFoundMsg, setNotFoundMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FindIdForm>({
    resolver: zodResolver(findIdSchema),
    mode: 'onChange',
  })

  const [foundId, setFoundId] = useState<string | null>(null)

  const mut = useFindLoginIdMutation()

  const onSubmit = (form: FindIdForm) => {
    setCopied(false)
    setNotFoundMsg(null)
    setFoundId(null)

    mut.mutate(
      { name: form.name, email: form.email },
      {
        onSuccess: (loginId) => {
          setFoundId(loginId ?? null)
          if (!loginId) setNotFoundMsg('일치하는 정보가 없습니다.')
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error && err.message ? err.message : '일치하는 정보가 없습니다.'
          setNotFoundMsg(msg)
        },
      },
    )
  }

  const handleCopy = async () => {
    if (foundId) {
      await navigator.clipboard.writeText(foundId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  const handleGoToLogin = () => {
    window.location.href = '/login'
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={Logo} alt="tekcit logo" className={styles.logo} />
        <h2 className={styles.title}>아이디 찾기</h2>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.fields}>
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
          </div>

          {/* ✅ 버튼은 form 안에 그대로 둠 */}
          <div className={styles.actions}>
            <Button type="submit" className="w-full h-11" disabled={!isValid || mut.isPending}>
              {mut.isPending ? '조회 중…' : '아이디 찾기'}
            </Button>
          </div>
        </form>

        {foundId && (
          <>
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
            {copied && <p className={styles.copied}>아이디가 복사되었어요!</p>}

            <Button onClick={handleGoToLogin} className="w-full h-11 mt-2">
              로그인 하기
            </Button>
          </>
        )}

      </div>
    </div>
  )
}

export default FindIdPage
