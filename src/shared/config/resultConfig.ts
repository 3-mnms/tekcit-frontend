// src/pages/result/resultConfig.ts
export type ResultType = 'booking' | 'transfer' | 'wallet-charge' | 'transfer-fee' | 'refund'
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
      primary: { label: '내 예매 확인', to: '/my/tickets' },
      secondary: { label: '메인으로', to: '/' },
    },
    fail: {
      title: '결제 실패',
      message: '예매 결제에 실패했습니다. 다시 시도해 주세요.',
      primary: { label: '다시 결제하기', to: '/payment' },
      secondary: { label: '고객센터', to: '/support' },
    },
  },

  transfer: {
    success: {
      title: '결제 성공',
      message: '양도 결제가 완료되었습니다.',
      primary: { label: '수수료 결제하기', to: '/payment/transfer/transfer-fee' },
    },
    fail: {
      title: '결제 실패',
      message: '양도 결제에 실패했습니다. 다시 시도해 주세요.',
      primary: { label: '다시 결제하기', to: '/payment/transfer' },
      secondary: { label: '고객센터', to: '/support' },
    },
  },

  'transfer-fee': {
    success: {
      title: '결제 성공',
      message: '양도 수수료 결제가 완료되었습니다.',
      primary: { label: '양도 내역 확인', to: '/my/transfers' },
      secondary: { label: '메인으로', to: '/' },
    },
    fail: {
      title: '결제 실패',
      message: '양도 수수료 결제에 실패했습니다. 다시 시도해 주세요.',
      primary: { label: '다시 결제하기', to: '/payment/transfer/transfer-fee' },
      secondary: { label: '고객센터', to: '/support' },
    },
  },

  'wallet-charge': {
    success: {
      title: '충전 완료',
      message: '포인트 충전이 완료되었습니다.',
      primary: { label: '지갑 보기', to: '/payment/wallet-point' },
      secondary: { label: '결제 계속하기', to: '/payment' },
    },
    fail: {
      title: '충전 실패',
      message: '포인트 충전에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      primary: { label: '다시 충전하기', to: '/payment/wallet-point/money-charge' },
      secondary: { label: '고객센터', to: '/support' },
    },
  },

  refund: { 
    success: {
      title: '환불 완료',
      message: '환불이 정상적으로 처리되었습니다.',
      primary: { label: '환불 내역 확인', to: '/my/refunds' },
      secondary: { label: '메인으로', to: '/' },
    },
    fail: {
      title: '환불 실패',
      message: '환불 처리에 실패했습니다. 고객센터로 문의해 주세요.',
      primary: { label: '고객센터', to: '/support' },
      secondary: { label: '메인으로', to: '/' },
    },
  },
}
