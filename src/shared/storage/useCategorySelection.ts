// src/shared/storage/useCategorySelection.ts
import { create } from 'zustand'

type State = {
  activeChild?: string | null;   // 선택된 원본 장르명(genrenm)
  setActiveChild: (g?: string | null) => void;
}
export const useCategorySelection = create<State>((set) => ({
  activeChild: null,
  setActiveChild: (g) => set({ activeChild: g ?? null }),
}))
