// src/models/transfer/tanstack-query/useTekcitPay.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTekcitPayAccount,
  createTekcitPayAccount,
  payByTekcitPay,
} from '@/shared/api/transfer/tekcitPay';
import type { TekcitPayAccountResponseDTO, PayByTekcitPayDTO } from '@/models/transfer/tekcitPayTypes';

const qk = {
  account: ['tekcitPay', 'account'] as const,
};

export function useTekcitPayAccountQuery(enabled = true) {
  return useQuery<TekcitPayAccountResponseDTO>({
    queryKey: qk.account,
    queryFn: getTekcitPayAccount,
    enabled,
    staleTime: 60_000, // 1분
    retry: false,      // 존재하지 않을 수 있어 의도적으로 false
  });
}

export function useCreateTekcitPayAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (password: number) => createTekcitPayAccount(password),
    onSuccess: () => {
      // 생성 성공 시 계정 정보 갱신
      qc.invalidateQueries({ queryKey: qk.account });
    },
  });
}

export function usePayByTekcitPayMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PayByTekcitPayDTO) => payByTekcitPay(dto),
    onSuccess: () => {
      // 결제 성공 시 잔액 변동 가능 → 갱신
      qc.invalidateQueries({ queryKey: qk.account });
    },
  });
}
