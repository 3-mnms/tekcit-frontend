import { useEffect, useId, useState } from 'react'
import CardSelectBox from '@/components/payment/pay/CardSelectBox'
import Input from '@/components/common/input/Input'
import styles from './GeneralCardPayment.module.css'

interface GeneralCardPaymentProps {
  isOpen: boolean
  onToggle: () => void
}

const GeneralCardPayment: React.FC<GeneralCardPaymentProps> = ({ isOpen, onToggle }) => {
  const [userType, setUserType] = useState<'personal' | 'corporate'>('personal')
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit')
  const [installment, setInstallment] = useState<string>('일시불')
  const [selectedCard, setSelectedCard] = useState<string>('')

  const [form, setForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardHolder: '',
    birthOrBiz: '',
    password2: '',
  })

  const rgUserId = useId()
  const rgTypeId = useId()

  useEffect(() => {
    if (cardType === 'debit') setInstallment('일시불')
  }, [cardType])

  // 공용 핸들러 멍
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    key: keyof typeof form | 'installment',
  ) => {
    let val = e.target.value

    switch (key) {
      case 'cardNumber':
        val = val
          .replace(/\D/g, '')
          .slice(0, 16)
          .replace(/(\d{4})(?=\d)/g, '$1 ')
        break
      case 'expiry':
        val = val.replace(/\D/g, '').slice(0, 4)
        if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2)}`
        break
      case 'cvc':
        val = val.replace(/\D/g, '').slice(0, 3)
        break
      case 'password2':
        val = val.replace(/\D/g, '').slice(0, 2)
        break
      case 'birthOrBiz':
        val = val.replace(/\D/g, '').slice(0, userType === 'personal' ? 6 : 10)
        break
    }

    if (key === 'installment') setInstallment(val)
    else setForm((prev) => ({ ...prev, [key]: val }))
  }

  return (
    <div className={styles['general-card-payment-container']}>
      <div className={styles['payment-section']}>
        <label className={styles['simple-payment-option']}>
          <input
            type="radio"
            id="general-payment"
            name="payment-method"
            checked={isOpen}
            onChange={onToggle}
          />
          <span className={styles['radio-label']}>일반 결제</span>
        </label>

        <div
          id="general-payment-panel"
          className={`${styles['general-payment-slide']} ${isOpen ? styles.open : ''}`}
          role="region"
          aria-labelledby="general-payment"
        >
          <div className={styles['general-payment-section']}>
            {/* 사용자 구분 */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>사용자 구분</legend>
              <div className={styles['options-grid']} role="radiogroup" aria-labelledby={rgUserId}>
                <span id={rgUserId} className="sr-only">
                  사용자 구분
                </span>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="user-type"
                    value="personal"
                    checked={userType === 'personal'}
                    onChange={() => setUserType('personal')}
                  />
                  개인
                </label>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="user-type"
                    value="corporate"
                    checked={userType === 'corporate'}
                    onChange={() => setUserType('corporate')}
                  />
                  법인
                </label>
              </div>
            </fieldset>

            {/* 카드 종류 */}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>카드 종류</legend>
              <div className={styles['options-grid']} role="radiogroup" aria-labelledby={rgTypeId}>
                <span id={rgTypeId} className="sr-only">
                  카드 종류
                </span>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="card-type"
                    value="credit"
                    checked={cardType === 'credit'}
                    onChange={() => setCardType('credit')}
                  />
                  신용카드
                </label>
                <label className={styles.option}>
                  <input
                    type="radio"
                    name="card-type"
                    value="debit"
                    checked={cardType === 'debit'}
                    onChange={() => setCardType('debit')}
                  />
                  체크카드
                </label>
              </div>
            </fieldset>

            {/* 카드/할부 선택 라인 */}
            <div className={styles.grid}>
              <div className={styles.colFull}>
                <CardSelectBox selectedCard={selectedCard} onSelect={setSelectedCard} />
              </div>
            </div>

            {/* 카드번호 */}
            <div className={styles.grid}>
              <div className={styles.colFull}>
                <Input
                  label="카드번호"
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  onChange={(e) => handleInput(e, 'cardNumber')}
                />
              </div>
            </div>

            {/* 유효기간 · CVC · 비밀번호 앞 2자리 */}
            <div className={styles.grid}>
              <div className={styles.col1of3}>
                <Input
                  label="유효기간"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={(e) => handleInput(e, 'expiry')}
                />
              </div>
              <div className={styles.col1of3}>
                <Input
                  label="CVC / CVV"
                  placeholder="3자리"
                  value={form.cvc}
                  onChange={(e) => handleInput(e, 'cvc')}
                />
              </div>
              <div className={styles.col1of3}>
                <Input
                  label="비밀번호 앞 2자리"
                  placeholder="**"
                  value={form.password2}
                  onChange={(e) => handleInput(e, 'password2')}
                />
              </div>
            </div>

            {/* 카드 소유자 이름 */}
            <div className={styles.grid}>
              <div className={styles.colFull}>
                <Input
                  label="카드 소유자 이름 (영문)"
                  placeholder="HONG GILDONG"
                  value={form.cardHolder}
                  onChange={(e) => handleInput(e, 'cardHolder')}
                />
              </div>
            </div>

            {/* 생년월일/사업자번호 · 할부 개월 수 */}
            <div className={styles.grid}>
              <div className={styles.col1of2}>
                <Input
                  label={userType === 'personal' ? '생년월일 (YYMMDD)' : '사업자등록번호 (10자리)'}
                  placeholder={userType === 'personal' ? '예: 990101' : '예: 1234567890'}
                  value={form.birthOrBiz}
                  onChange={(e) => handleInput(e, 'birthOrBiz')}
                />
              </div>
              <div className={styles.col1of2}>
                <Input
                  type="select"
                  label="할부 개월 수"
                  defaultValue={installment}
                  options={['일시불', '3개월', '6개월', '12개월']}
                  disabled={cardType === 'debit'}
                  onChange={(e) => handleInput(e, 'installment')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeneralCardPayment
