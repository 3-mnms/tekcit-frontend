import { api } from '@/shared/config/axios';
import type {
  MyPageUnionDTO,
  UpdateUserRequestDTO,
  UpdateUserResponseDTO,
} from '@/models/my/userTypes';

export const apiGetMyPageUserInfo = async (): Promise<MyPageUnionDTO> => {
  const { data } = await api.get('/myPage/userInfo');
  return (data?.data ?? data) as MyPageUnionDTO;
};

export const apiUpdateUser = async (payload: UpdateUserRequestDTO): Promise<UpdateUserResponseDTO> => {
  const { data } = await api.patch('/myPage/updateUser', payload);
  return (data?.data ?? data) as UpdateUserResponseDTO;
};