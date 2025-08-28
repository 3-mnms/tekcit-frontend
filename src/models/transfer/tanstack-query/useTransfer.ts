import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchTransfereeByEmail, fetchTransferor } from '@/shared/api/transfer/userApi';
import type { AssignmentDTO } from '@/models/transfer/userType';

export function useSearchTransferee() {
  return useMutation<AssignmentDTO, Error, string>({
    mutationKey: ['transfer', 'transferee', 'search'],
    mutationFn: (email: string) => fetchTransfereeByEmail(email),
  });
}

export function useTransferor(options?: { enabled?: boolean; staleTime?: number }) {
  return useQuery<AssignmentDTO, Error>({
    queryKey: ['transfer', 'transferor', 'me'],
    queryFn: fetchTransferor,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
