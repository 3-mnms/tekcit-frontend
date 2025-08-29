import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiGetMyPageUserInfo,
  apiUpdateUser,
} from '@/shared/api/my/myPage';
import type {
  MyPageUnionDTO,
  UpdateUserRequestDTO,
  UpdateUserResponseDTO,
} from '@/models/my/userTypes';

export const qk = {
  myPageUser: ['myPage', 'userInfo'] as const,
};

export const useMyPageUserQuery = () =>
  useQuery<MyPageUnionDTO>({
    queryKey: qk.myPageUser,
    queryFn: apiGetMyPageUserInfo,
    staleTime: 60_000, 
  });

export const useUpdateUserMutation = () => {
  const qc = useQueryClient();
  return useMutation<UpdateUserResponseDTO, unknown, UpdateUserRequestDTO>({
    mutationFn: apiUpdateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.myPageUser });
    },
  });
};