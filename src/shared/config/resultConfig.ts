// src/pages/result/resultConfig.ts
export type ResultType = 'booking' | 'transfer' | 'wallet-charge' | 'refund'
export type ResultStatus = 'success' | 'fail'

type View = {
  title: string
  message: string
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
}

export const RESULT_CONFIG: Record<ResultType, Record<ResultStatus, View>> = {
  booking: {
    success: {
      title: '결제 성공',
      message: '예매 결제가 완료되었습니다.',
      primary: { label: '내 예매 확인', to: '/mypage/ticket/history' },
    },
    fail: {
      title: '결제 실패',
      message: '예매 결제에 실패했습니다. 다시 시도해 주세요.',
      primary: { label: '다시 결제하기', to: '/festival' },
    },
  },

  transfer: {
    success: {
      title: '결제 성공',
      message: '양도 결제가 완료되었습니다.',
      primary: { label: '양도 내역 확인하기', to: '/mypage/ticket/transfer' },
      secondary: { label: '메인으로', to: '/' },
    },
    fail: {
      title: '결제 실패',
      message: '양도 결제에 실패했습니다. 다시 시도해 주세요.',
      primary: { label: '양도 내역 확인하기', to: '/mypage/ticket/transfer' },
    },
  },

  'wallet-charge': {
    success: {
      title: '충전 완료',
      message: '포인트 충전이 완료되었습니다.',
      primary: { label: '포인트 내역 확인하기', to: '/payment/wallet-point' },
    },
    fail: {
      title: '충전 실패',
      message: '포인트 충전에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      primary: { label: '포인트 내역 확인하기', to: '/payment/wallet-point' },
    },
  },

  refund: {
    success: {
      title: '환불 완료',
      message: '환불이 정상적으로 처리되었습니다.',
      primary: { label: '환불 내역 확인', to: '/mypage/ticket/history' },
      secondary: { label: '메인으로', to: '/' },
    },
    fail: {
      title: '환불 실패',
      message: '환불 처리에 실패했습니다.',
      primary: { label: '환불 내역 확인', to: '/mypage/ticket/history' },
      secondary: { label: '메인으로', to: '/' },
    },
  },
}
