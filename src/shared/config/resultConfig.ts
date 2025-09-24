// src/pages/result/resultConfig.ts
export type ResultType = 'booking' | 'transfer' | 'refund'
export type ResultStatus = 'success' | 'fail'

type View = {
  title: string
  message: string
  primary: { label: string; action: () => void }
  secondary?: { label: string; action: () => void }
}

export const RESULT_CONFIG: Record<ResultType, Record<ResultStatus, View>> = {
  booking: {
    success: {
      title: '결제 성공',
      message: '예매 결제가 완료되었습니다.',
      primary: { 
        label: '내 예매 확인', 
        action: () => window.location.href = '/mypage/ticket/history' 
      },
    },
    fail: {
      title: '결제 실패',
      message: '예매 결제에 실패했습니다. 다시 시도해 주세요.',
      primary: { 
        label: '다시 결제하기', 
        action: () => window.location.href = '/festival' 
      },
    },
  },

  transfer: {
    success: {
      title: '결제 성공',
      message: '양도 결제가 완료되었습니다.',
      primary: { 
        label: '양도 내역 확인하기', 
        action: () => window.location.href = '/mypage/ticket/transfer' 
      },
      secondary: { 
        label: '메인으로', 
        action: () => window.location.href = '/' 
      },
    },
    fail: {
      title: '결제 실패',
      message: '양도 결제에 실패했습니다. 다시 시도해 주세요.',
      primary: { 
        label: '양도 내역 확인하기', 
        action: () => window.location.href = '/mypage/ticket/transfer' 
      },
    },
  },

  refund: {
    success: {
      title: '환불 완료',
      message: '환불이 정상적으로 처리되었습니다.',
      primary: { 
        label: '환불 내역 확인', 
        action: () => window.location.href = '/mypage/ticket/history' 
      },
      secondary: { 
        label: '메인으로', 
        action: () => window.location.href = '/' 
      },
    },
    fail: {
      title: '환불 실패',
      message: '환불 처리에 실패했습니다.',
      primary: { 
        label: '환불 내역 확인', 
        action: () => window.location.href = '/mypage/ticket/history' 
      },
      secondary: { 
        label: '메인으로', 
        action: () => window.location.href = '/' 
      },
    },
  },
}
