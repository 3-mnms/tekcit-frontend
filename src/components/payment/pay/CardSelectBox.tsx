import styles from '@components/payment/pay/CardSelectBox.module.css'

interface CardSelectBoxProps {
  selectedCard: string
  onSelect: (card: string) => void
}

const cardCompanies = [
  '', '신한', '현대', '비씨', 'KB국민', '삼성', '롯데', '하나', 'NH', '우리'
]

const CardSelectBox: React.FC<CardSelectBoxProps> = ({ selectedCard, onSelect }) => {
  return (
    <select
      className={styles['card-select-dropdown']}
      value={selectedCard}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">카드를 선택해 주세요</option>
      {cardCompanies.slice(1).map((card) => (
        <option key={card} value={card}>
          {card}
        </option>
      ))}
    </select>
  )
}

export default CardSelectBox
