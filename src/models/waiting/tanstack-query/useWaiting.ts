import { useMutation } from '@tanstack/react-query';
import {
  apiEnterWaitingQueue,
  apiExitWaitingQueue,
  apiReleaseUserFromBooking,
} from '@/shared/api/waiting/waitingApi';
import type {
  WaitingEnterParams,
  WaitingExitParams,
  WaitingReleaseParams,
  WaitingNumberResponseDTO,
} from '@/models/waiting/waitingTypes';

/**
 * 대기열 진입 (enter)
 * 성공 시 WaitingNumberResponseDTO 반환
 */
export function useEnterWaitingMutation() {
  return useMutation<WaitingNumberResponseDTO, unknown, WaitingEnterParams>({
    mutationFn: async ({ festivalId, reservationDate }) =>
      apiEnterWaitingQueue(festivalId, reservationDate),
  });
}

/**
 * 예매 페이지 퇴장 처리 (release)
 * 성공 시 서버 메시지(string) 반환
 */
export function useReleaseWaitingMutation() {
  return useMutation<string, unknown, WaitingReleaseParams>({
    mutationFn: async ({ festivalId, reservationDate }) =>
      apiReleaseUserFromBooking(festivalId, reservationDate),
  });
}

/**
 * 대기열에서 스스로 나가기 (exit)
 * 성공 시 서버 메시지(string) 반환
 */
export function useExitWaitingMutation() {
  return useMutation<string, unknown, WaitingExitParams>({
    mutationFn: async ({ festivalId, reservationDate }) =>
      apiExitWaitingQueue(festivalId, reservationDate),
  });
}
