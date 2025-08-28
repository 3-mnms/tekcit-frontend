import { api } from '@/shared/config/axios';
import type {
  MyPageUnionDTO,
  UpdateUserRequestDTO,
  UpdateUserResponseDTO,
  CheckPwDTO,
  ResetPwDTO,
} from '@/models/my/userTypes';

// GET /api/myPage/userInfo
export const apiGetMyPageUserInfo = async (): Promise<MyPageUnionDTO> => {
  const { data } = await api.get('/myPage/userInfo');
  // 백엔드 공통 SuccessResponse 래핑 대응
  // { success, data, message } 형태 혹은 바로 dto
  return (data?.data ?? data) as MyPageUnionDTO;
};

// PATCH /api/myPage/updateUser
export const apiUpdateUser = async (payload: UpdateUserRequestDTO): Promise<UpdateUserResponseDTO> => {
  const { data } = await api.patch('/myPage/updateUser', payload);
  return (data?.data ?? data) as UpdateUserResponseDTO;
};

// POST /api/myPage/checkPassword
export const apiCheckPassword = async (payload: CheckPwDTO): Promise<void> => {
  const { data } = await api.post('/myPage/checkPassword', payload);
  // 200 OK + 메시지, 본문은 없음. 필요 시 data.message 사용 가능
  return;
};

// PATCH /api/myPage/resetPassword
export const apiResetPassword = async (payload: ResetPwDTO): Promise<void> => {
  const { data } = await api.patch('/myPage/resetPassword', payload);
  return;
};
