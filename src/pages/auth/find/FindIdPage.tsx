import React, { useState } from 'react'
import { FaRegCopy } from 'react-icons/fa6'
import Button from '@/components/common/button/Button'
import AuthCard from '@/components/auth/find/AuthCard'
import styles from '@/components/auth/find/AuthForm.module.css'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { findIdSchema, type FindIdForm } from '@/models/auth/schema/findSchema'
import { useFindLoginIdMutation } from '@/models/auth/tanstack-query/useFindLoginInfo'

const FindIdPage: React.FC = () => {
  const [copied, setCopied] = useState(false)
  const [foundId, setFoundId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FindIdForm>({
    resolver: zodResolver(findIdSchema),
    mode: 'onChange',
  })

  const mut = useFindLoginIdMutation()

  const onSubmit = (f: FindIdForm) => {
    setCopied(false)
    setFoundId(null)
    mut.mutate(
      { name: f.name, email: f.email },
      {
        onSuccess: (loginId) =>
          loginId ? setFoundId(loginId) : alert('일치하는 정보가 없습니다.'),
        onError: () => alert('일치하는 정보가 없습니다.'),
      },
    )
  }

  return (
    <AuthCard title="아이디 찾기">
      {!foundId ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="이름"
            aria-invalid={!!errors.name}
            {...register('name')}
            className={styles.input}
          />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}

          <input
            type="email"
            placeholder="이메일"
            aria-invalid={!!errors.email}
            {...register('email')}
            className={styles.input}
          />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}

          <div className={styles.actions}>
            <Button type="submit" className="w-full h-11" disabled={!isValid || mut.isPending}>
              {mut.isPending ? '조회 중…' : '아이디 찾기'}
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.resultRow}>
            <input
              type="text"
              className={styles.resultInput}
              value={foundId}
              readOnly
              aria-label="찾은 아이디"
            />
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(foundId)
                setCopied(true)
                setTimeout(() => setCopied(false), 1800)
              }}
              className={styles.copyButton}
              aria-label="아이디 복사"
            >
              <FaRegCopy />
            </button>
          </div>
          {copied && <p className={styles.copied}>아이디가 복사되었습니다.</p>}
          <div className={styles.actions}>
            <Button onClick={() => (window.location.href = '/login')} className="w-full h-11 mt-2">
              로그인하기
            </Button>
          </div>
        </>
      )}
    </AuthCard>
  )
}

export default FindIdPage
