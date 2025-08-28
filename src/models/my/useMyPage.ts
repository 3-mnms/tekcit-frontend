import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiGetMyPageUserInfo,
  apiUpdateUser,
  apiCheckPassword,
  apiResetPassword,
} from '@/shared/api/my/mypage';
import type {
  MyPageUnionDTO,
  UpdateUserRequestDTO,
  CheckPwDTO,
  ResetPwDTO,
  UpdateUserResponseDTO,
} from '@/models/my/userTypes';

export const qk = {
  myPageUser: ['myPage', 'userInfo'] as const,
};

export const useMyPageUserQuery = () =>
  useQuery<MyPageUnionDTO>({
    queryKey: qk.myPageUser,
    queryFn: apiGetMyPageUserInfo,
    staleTime: 60_000, // 1분
  });

export const useUpdateUserMutation = () => {
  const qc = useQueryClient();
  return useMutation<UpdateUserResponseDTO, unknown, UpdateUserRequestDTO>({
    mutationFn: apiUpdateUser,
    onSuccess: () => {
      // 수정 후 내 정보 재조회
      qc.invalidateQueries({ queryKey: qk.myPageUser });
    },
  });
};

export const useCheckPasswordMutation = () =>
  useMutation<void, unknown, CheckPwDTO>({
    mutationFn: apiCheckPassword,
  });

export const useResetPasswordMutation = () =>
  useMutation<void, unknown, ResetPwDTO>({
    mutationFn: apiResetPassword,
  });
