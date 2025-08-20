import { useMutation } from '@tanstack/react-query';
import { postFindLoginId } from '@/shared/api/auth/find';
import type { FindLoginIdDTO } from '@/shared/api/auth/find';

export function useFindLoginIdMutation() {
  return useMutation({
    mutationFn: (dto: FindLoginIdDTO) => postFindLoginId(dto),
  });
}
