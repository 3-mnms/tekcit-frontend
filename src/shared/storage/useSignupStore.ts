// src/shared/storage/useSignupStore.ts
import { create } from 'zustand';
import type { KakaoStep2, KakaoStep3 } from '@/models/auth/schema/kakaoSignupSchema';

type Provider = 'local' | 'kakao';

interface SignupState {
  provider: Provider;
  kakao: Partial<KakaoStep2 & KakaoStep3>;
  setProvider: (p: Provider) => void;
  updateKakao: (p: Partial<KakaoStep2 & KakaoStep3>) => void;
  reset: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  provider: 'local',
  kakao: {},
  setProvider: (p) => set({ provider: p }),
  updateKakao: (p) => set((s) => ({ kakao: { ...s.kakao, ...p } })),
  reset: () => set({ provider: 'local', kakao: {} }),
}));
