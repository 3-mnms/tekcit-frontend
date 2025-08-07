// src/models/payment/TransferFee.ts

export interface TransferFee {
  perFee: number
  totalFee: number
}

export const transferFee: TransferFee = {
  perFee: 1000,
  totalFee: 2000,
}
