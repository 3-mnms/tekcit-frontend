import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/common/Button'
import Input from '@/components/common/input/Input'
import styles from './EditInfoPage.module.css'

import { isUser, type UpdateUserRequestDTO } from '@/models/my/userTypes'
import { useMyPageUserQuery, useUpdateUserMutation } from '@/models/my/useMyPage'

const schema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  phone: z
    .string()
    .regex(/^01[016789]-\d{3,4}-\d{4}$/, '전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678'),
  residentNum: z
    .string()
    .regex(/^\d{6}-[1-4]$/, '주민번호 형식은 6자리-성별코드(1~4)입니다. 예: 990101-1'),
})

type FormValues = z.infer<typeof schema>

const EditInfoPage: React.FC = () => {
  const nav = useNavigate()
  const { data, isLoading, isError } = useMyPageUserQuery()
  const { mutateAsync, isPending } = useUpdateUserMutation()

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      residentNum: '',
    },
  })

  React.useEffect(() => {
    if (!data) return
    reset({
      name: data.name ?? '',
      phone: data.phone ?? '',
      residentNum: isUser(data) ? data.residentNum ?? '' : '',
    })
  }, [data, reset])

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>불러오는 중…</div>
      </section>
    )
  }
  if (isError || !data) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>불러오기에 실패했어요.</div>
      </section>
    )
  }

  const onSubmit = async (vals: FormValues) => {
    const payload: UpdateUserRequestDTO = {
      name: vals.name,
      phone: vals.phone,
      residentNum: vals.residentNum,
    }

    try {
      await mutateAsync(payload)          
      alert('저장되었습니다.');  
      nav('/mypage/myinfo/detail')
    } catch (err) {
      console.error('[EditInfo] update failed:', err)
      alert('저장 중 오류가 발생했어요.')
    }
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>정보 수정</h2>

      <form className={styles.card} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={`${styles.formGrid} ${styles.compact}`}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input label="이름" {...field} />}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input label="전화번호" placeholder="010-1234-5678" {...field} />
            )}
          />

          <Controller
            name="residentNum"
            control={control}
            render={({ field }) => (
              <Input label="주민번호(앞6+뒤1)" placeholder="YYMMDD-#" {...field} />
            )}
          />
        </div>

        <div className={`${styles.card} ${styles.actionsCard}`}>
          <div className={styles.actions}>
            <Button
              className={styles.btnPrimary}
              type="button"
              onClick={() => nav('/mypage/myinfo/detail')}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              className={styles.btnPrimary}
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? '저장 중…' : '저장'}
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}

export default EditInfoPage
