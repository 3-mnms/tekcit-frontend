// src/components/my/myinfo/password/ResetPasswordForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import { useResetPasswordMutation } from '@/models/auth/tanstack-query/usePassword';
import styles from './PasswordForms.module.css';
import { FaLock } from 'react-icons/fa';

const passwordRule = z
  .string()
  .refine(
    (val) =>
      val.length >= 8 && val.length <= 20 && /[A-Za-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val),
    { message: '8~20자의 영문/숫자/특수문자를 모두 포함해야 합니다.' },
  );

const schema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;
type Props = { onSuccess?: () => void };

const ResetPasswordForm: React.FC<Props> = ({ onSuccess }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const { mutateAsync, isPending } = useResetPasswordMutation();
  const [show, setShow] = React.useState({ new: false, confirm: false });

  const onSubmit = async (values: FormValues) => {
    await mutateAsync(values.newPassword);
    onSuccess?.();
  };

  return (
    <div className={`${styles.card} ${styles.cardAccent}`}>
      <h3 className={styles.cardTitle}>
        <FaLock className={styles.cardTitleIcon} aria-hidden /> 새 비밀번호 설정
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <div className={styles.field}>
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <div className={styles.inputWrap}>
                <Input
                  type={show.new ? 'text' : 'password'}
                  placeholder="새 비밀번호"
                  {...field}
                  value={field.value ?? ''}
                  className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                  label={
                    <span className={styles.labelWithIcon}>
                      <FaLock className={styles.labelIcon} aria-hidden />
                      새 비밀번호
                    </span>
                  }
                />
              </div>
            )}
          />
          {errors.newPassword && <p className={styles.error}>{errors.newPassword.message}</p>}
        </div>

        <div className={styles.field}>
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <div className={styles.inputWrap}>
                <Input
                  type={show.confirm ? 'text' : 'password'}
                  placeholder="새 비밀번호 확인"
                  {...field}
                  value={field.value ?? ''}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  label={
                    <span className={styles.labelWithIcon}>
                      <FaLock className={styles.labelIcon} aria-hidden />
                      새 비밀번호 확인
                    </span>
                  }
                />
              </div>
            )}
          />
          {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword.message}</p>}
        </div>

        <div className={styles.actionsRight}>
          <Button type="submit" disabled={isPending || !isValid} className={`${styles.btn} ${styles.btnPrimary}`}>
            {isPending ? '변경 중…' : '비밀번호 변경'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
