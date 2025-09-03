// models/waiting/tanstack-query/useWaiting.ts
import { useMutation } from '@tanstack/react-query';
import {
  enterWaiting,
  releaseUser,
  exitWaitingUser,
} from '@/shared/api/waiting/aitingApi';
import type {
  EnterWaitingParams,
  ExitOrReleaseParams,
  WaitingNumberResponseDTO,
} from '../waitingTypes';

export const WaitingKeys = {
  base: ['waiting'] as const,
  enter: () => [...WaitingKeys.base, 'enter'] as const,
  release: () => [...WaitingKeys.base, 'release'] as const,
  exit: () => [...WaitingKeys.base, 'exit'] as const,
};

export const useEnterWaitingMutation = () =>
  useMutation<WaitingNumberResponseDTO, unknown, EnterWaitingParams>({
    mutationKey: WaitingKeys.enter(),
    mutationFn: (p) => enterWaiting(p),
  });

export const useReleaseUserMutation = () =>
  useMutation<string, unknown, ExitOrReleaseParams>({
    mutationKey: WaitingKeys.release(),
    mutationFn: (p) => releaseUser(p),
  });

export const useExitWaitingMutation = () =>
  useMutation<string, unknown, ExitOrReleaseParams>({
    mutationKey: WaitingKeys.exit(),
    mutationFn: (p) => exitWaitingUser(p),
  });
