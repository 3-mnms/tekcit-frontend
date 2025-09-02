// models/waiting/waitingTypes.ts

export type WaitingNumberResponseDTO = {
  userId: string;
  waitingNumber: number;
  immediateEntry: boolean;
  message: string;
};

export type EnterWaitingParams = {
  festivalId: string;
  reservationDate: string; // ISO string
};

export type ExitOrReleaseParams = EnterWaitingParams;
