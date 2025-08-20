import { useMutation } from '@tanstack/react-query';
import { postFindLoginId, postFindRegisteredEmail, sendEmailCode, verifyEmailCode } from '@/shared/api/auth/find';
import type { FindLoginIdDTO, FindPwEmailDTO  } from '@/shared/api/auth/find';

export function useFindLoginIdMutation() {
  return useMutation({
    mutationFn: (dto: FindLoginIdDTO) => postFindLoginId(dto),
  });
}

export function useFindRegisteredEmailMutation() {
  return useMutation({
    mutationFn: (dto: FindPwEmailDTO) => postFindRegisteredEmail(dto),
  });
}

export function useSendPwFindCode(email: string) {
  return useMutation({
    mutationFn: () => sendEmailCode(email, 'PASSWORD_FIND'),
  });
}

export function useVerifyPwFindCode(email: string, code: string) {
  return useMutation({
    mutationFn: () => verifyEmailCode(email, code, 'PASSWORD_FIND'),
  });
}