import { useMutation } from '@tanstack/react-query';
import { signupUser, checkLoginId, sendEmailCode, verifyEmailCode, checkEmail } from '@/shared/api/auth/user';

export const useSignupMutation = () =>
  useMutation({ mutationFn: signupUser });

export const useCheckLoginId = () => useMutation<boolean, unknown, string>({
  mutationFn: (loginId: string) => checkLoginId(loginId),
});

export const useCheckEmail = () =>
  useMutation({ mutationFn: (email: string) => checkEmail(email) });

export const useSendEmailCode = () =>
  useMutation({ mutationFn: (email: string) => sendEmailCode(email) });

export const useVerifyEmailCode = () =>
  useMutation({ mutationFn: (p: { email: string; code: string }) => verifyEmailCode(p.email, p.code) });