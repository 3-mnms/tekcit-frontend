// src/components/my/myinfo/password/CheckPasswordForm.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/common/button/Button';
import Input from '@/components/common/input/Input';
import { useCheckPasswordMutation } from '@/models/auth/tanstack-query/usePassword';
import styles from './PasswordForms.module.css';
import { FaShieldAlt } from 'react-icons/fa';

const schema = z.object({
  currentPassword: z.string().trim().min(1, '현재 비밀번호를 입력해주세요.'),
});
type FormValues = z.infer<typeof schema>;
type Props = { onVerified: () => void };

const CheckPasswordForm: React.FC<Props> = ({ onVerified }) => {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { currentPassword: '' },
  });

  const { mutateAsync, isPending } = useCheckPasswordMutation();
  const [show, setShow] = React.useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      clearErrors('currentPassword');
      await mutateAsync(values.currentPassword.trim());
      onVerified();
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      const fromServer =
        data?.message || data?.error || data?.detail || data?.errors?.[0]?.defaultMessage || null;
      if (status === 400 || status === 409) {
        alert(fromServer || '현재 비밀번호가 올바르지 않습니다.');
      } else {
        alert(fromServer || '비밀번호 확인에 실패했어요. 잠시 후 다시 시도해 주세요.');
      }
    }
  };

  return (
    <div className={`${styles.card} ${styles.cardAccent}`}>
      <h3 className={styles.cardTitle}>
        <FaShieldAlt className={styles.cardTitleIcon} aria-hidden /> 현재 비밀번호 확인
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <div className={styles.field}>
          <Controller
            name="currentPassword"
            control={control}
            render={({ field }) => (
              <div className={styles.inputWrap}>
                <Input
                  type={show ? 'text' : 'password'}
                  placeholder="현재 비밀번호"
                  {...field}
                  value={field.value ?? ''}
                  className={`${styles.input} ${errors.currentPassword ? styles.inputError : ''}`}
                />
              </div>
            )}
          />
          {errors.currentPassword && <p className={styles.error}>{errors.currentPassword.message}</p>}
        </div>

        <div className={styles.actionsRight}>
          <Button type="submit" disabled={isPending || !isValid} className={`${styles.btn} ${styles.btnPrimary}`}>
            {isPending ? '확인 중…' : '확인'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckPasswordForm;
