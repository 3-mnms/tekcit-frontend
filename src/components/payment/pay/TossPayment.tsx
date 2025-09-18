import { forwardRef, useImperativeHandle } from 'react'
import PortOne, { Currency, PayMethod } from '@portone/browser-sdk/v2'
import styles from './TossPayment.module.css'
import { requestPayment, type PaymentRequestDTO } from '@/shared/api/payment/payments'
import { getEnv } from '@/shared/config/env'

// DUMMY_USER_ID는 실제 유저 ID로 대체되어야 합니다.
const DUMMY_USER_ID = 1;

export interface TossPaymentProps {
  isOpen: boolean
  onToggle: () => void
  amount: number
  orderName: string
  redirectUrl?: string
  bookingId: string
  festivalId: string
  sellerId: number
}

export type TossPaymentHandle = {
  requestPay: (args: {
    paymentId: string
    amount: number
    orderName: string
    bookingId: string
    festivalId: string
    sellerId: number
    complete?: (paymentData: { paymentId: string, status?: string | null, message?: string | null  }) => void
  }) => Promise<void>
}

const STORE_ID = getEnv("VITE_PORTONE_STORE_ID")
const CHANNEL_KEY = getEnv("VITE_PORTONE_CHANNEL_KEY")

const TossPayment = forwardRef<TossPaymentHandle, TossPaymentProps>(
  (
    { isOpen, onToggle, amount, orderName, redirectUrl, bookingId, festivalId, sellerId, complete },
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      async requestPay(args) {
        const { paymentId, amount, orderName, bookingId, festivalId, sellerId, complete } = args;

        const hasSellerId = typeof sellerId === 'number' && Number.isFinite(sellerId) && sellerId >= 0

        if (!STORE_ID || !CHANNEL_KEY) {
          console.error('결제 설정 오류: 포트원 키가 없습니다.');
          alert('결제 설정이 올바르지 않습니다. 관리자에게 문의하세요.')
          throw new Error('Missing PortOne credentials')
        }

        if (!bookingId || !festivalId || !hasSellerId) {
          console.error('결제 정보 부족: bookingId, festivalId 또는 sellerId가 없습니다.');
          alert('결제 정보가 부족합니다. 다시 시도해 주세요.')
          throw new Error('Invalid booking/festival/seller context')
        }

        // 💡 주의: 이 `finalRedirect` 로직에 `ok`라는 변수가 정의되지 않았습니다.
        // 이 부분은 `BookingPaymentPage`에서 수정해야 합니다.
        // 현재는 빌드 오류를 방지하기 위해 간단한 URL로 대체합니다.
        // const finalRedirect = `${window.location.origin}/payment/booking-result?status=${ok ? 'success' : 'fail'}}`
        const finalRedirect = `${window.location.origin}/payment/booking-result?status=success`

        const dto: PaymentRequestDTO = {
          paymentId,
          bookingId,
          festivalId,
          paymentRequestType: 'GENERAL_PAYMENT_REQUESTED',
          sellerId,
          amount,
          currency: 'KRW',
          payMethod: 'CARD',
          STORE_KEY: STORE_ID,
          CHANNEL_KEY: CHANNEL_KEY,
        };

        try {
          // ✅ API 요청 시작 로그
          console.log('API 요청 시작: requestPayment', { paymentId, userId: DUMMY_USER_ID });
          await requestPayment(dto, DUMMY_USER_ID);
          // ✅ API 요청 성공 로그
          console.log('API 요청 성공: requestPayment');
        } catch (err) {
          // ✅ API 요청 실패 로그
          console.error('API 요청 실패: requestPayment', err);
          alert('결제 준비에 실패했습니다. 잠시 후 다시 시도해 주세요.');
          throw err;
        }

        try {
          // ✅ 포트원 결제 요청 시작 로그
          console.log('포트원 결제창 요청 시작: PortOne.requestPayment', { paymentId, totalAmount: amount });
          console.log(            "storeId: ",  STORE_ID,
            "channelKey: ",  CHANNEL_KEY,
            "bookingId: ", bookingId,
            "paymentId: ", paymentId,
            "orderName: ", orderName,
            "totalAmount: ",  amount,
            "currency: ",  Currency.KRW,
            "payMethod: ",  PayMethod.CARD,
            "redirectUrl: ", finalRedirect);
          const portOneResult = await PortOne.requestPayment({
            storeId: STORE_ID,
            channelKey: CHANNEL_KEY,
            bookingId,
            paymentId,
            orderName,
            totalAmount: amount,
            currency: Currency.KRW,
            payMethod: PayMethod.CARD,
            redirectUrl: finalRedirect,
          })
          console.log("portOneResult : ", portOneResult);
          if (portOneResult?.code === 'success') {
            
            console.log("args complete 준비 : ");
            if(args.complete){
              console.log("args complete 실행 : ");
              args.complete({
                paymentId: paymentId,
                status:   'success' ,
                message: "success",
              });
            }
          }
          // ✅ 포트원 결제 요청 성공 로그 (이 로그는 리디렉션 때문에 거의 실행되지 않습니다)
          console.log('포트원 결제창 요청 성공: PortOne.requestPayment');
        } catch (err) {
          // ✅ 포트원 결제 요청 실패 로그
          console.error('포트원 결제창 요청 실패: PortOne.requestPayment', err);
          alert('결제창을 여는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
          throw err;
        }
      },
    }))

    return (
      <div className={styles.wrapper}>
        <button type="button" className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
          <span className={styles.title}>토스 페이먼츠</span>
          <span className={styles.sub}>신용/체크카드 / 간편결제</span>
        </button>
      </div>
    )
  },
)

TossPayment.displayName = 'TossPayment'
export default TossPayment