import React, { useEffect, useState } from 'react'
import styles from './Keypad.module.css'

interface KeypadProps {
  onPress: (value: string) => void
}

const Keypad: React.FC<KeypadProps> = ({ onPress }) => {
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([])

  // 숫자 섞는 함수
  const shuffleArray = (array: number[]) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  // 마운트 시 0~9 랜덤 배열 생성
  useEffect(() => {
    setShuffledNumbers(shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))
  }, [])

  return (
    <div className={styles.keypad}>
      {shuffledNumbers.map((num, index) => (
        <button
          key={index}
          className={styles.key}
          onClick={() => onPress(num.toString())}
        >
          {num}
        </button>
      ))}

      {/* 삭제 버튼들 */}
      <button className={styles.key} onClick={() => onPress('삭제')}>삭제</button>
      <button className={styles.key} onClick={() => onPress('전체삭제')}>전체삭제</button>
    </div>
  )
}

export default Keypad
