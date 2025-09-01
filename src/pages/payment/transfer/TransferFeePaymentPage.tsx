import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './TransferFeePaymentPage.module.css'
import Button from '@/components/common/button/Button'
import ConfirmModal from '@/components/common/modal/AlertModal'
import PasswordInputModal from '@/components/payment/modal/PasswordInputModal'

import TransferFeeInfo from '@/components/payment/transfer/TransferFeeInfo'
import TicketInfoSection from '@/components/payment/transfer/TicketInfoSection'
import { bookingTransfer } from '@/models/payment/bookingTransfer'
import { transferFee } from '@/models/payment/TransferFee'
import WalletPayment from '@/components/payment/pay/TekcitPay'

const TransferFeePaymentPage: React.FC = () => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isAgreed, setIsAgreed] = useState<boolean>(false)
  const [isPaying, setIsPaying] = useState(false)

  const navigate = useNavigate()

  // ✅ 공통 결과 페이지 이동 헬퍼 멍
  const routeToResult = useCallback(
    (ok: boolean, extra?: Record<string, string | undefined>) => {
      const params = new URLSearchParams({
        type: 'transfer-fee', // 수수료 결제 타입
        status: ok ? 'success' : 'fail',
        ...(extra ?? {}),
      })
      navigate(`/payment/result?${params.toString()}`)
    },
    [navigate],
  )

  // 결제 버튼 클릭
  const handlePayment = () => {
    if (!isAgreed || isPaying) return
    setIsConfirmModalOpen(true)
  }

  // 확인 모달 → 비밀번호 모달
  const handleConfirm = () => {
    setIsConfirmModalOpen(false)
    setIsPasswordModalOpen(true)
  }
  const handleCancel = () => setIsConfirmModalOpen(false)

  // 킷페이 비밀번호 입력 완료 → 실제 결제 처리 후 결과 페이지 이동
  const handlePasswordComplete = async (password: string) => {
    console.log('입력된 비밀번호:', password)
    setIsPasswordModalOpen(false)
    setIsPaying(true)
    try {
      // TODO: 실제 API 연동
      const ok = Math.random() < 0.95 // 예시
      const txId = Math.random().toString(36).slice(2, 10)
      routeToResult(ok, { txId })
    } catch (e) {
      console.error(e)
      routeToResult(false)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>양도 수수료 결제</h1>

        {/* 티켓 정보 */}
        <TicketInfoSection
          title={bookingTransfer.product.title}
          date={bookingTransfer.product.datetime}
          ticket={bookingTransfer.product.ticket}
        />

        {/* 결제 수단 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>결제 수단</h2>
          <div className={styles.paymentMethodWrapper}>
            <WalletPayment isOpen={true} onToggle={() => {}} />
          </div>
        </section>

        {/* 수수료 정보 */}
        <section className={styles.feeSection}>
          <TransferFeeInfo perFee={transferFee.perFee} totalFee={transferFee.totalFee} />
        </section>

        {/* 약관 동의 */}
        <section className={styles.termsSection}>
          <label className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span>(필수) 양도 서비스 이용약관 및 개인정보 수집 및 이용에 동의합니다.</span>
          </label>
        </section>

        {/* 결제 버튼 */}
        <div className={styles.buttonWrapper}>
          <Button
            className="w-full h-12"
            disabled={!isAgreed || isPaying}
            onClick={handlePayment}
          >
            {isPaying ? '결제 중...' : '수수료 결제하기'}
          </Button>
        </div>
      </div>

      {/* 확인 모달 */}
      {isConfirmModalOpen && (
        <ConfirmModal onConfirm={handleConfirm} onCancel={handleCancel}>
          양도 수수료 결제를 진행하시겠습니까?
        </ConfirmModal>
      )}

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <PasswordInputModal
          onComplete={handlePasswordComplete}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </>
  )
}

export default TransferFeePaymentPage
