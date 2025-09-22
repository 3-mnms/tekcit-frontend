import React, { useEffect, useState } from 'react';
import styles from './Keypad.module.css';
import { FaBackspace } from 'react-icons/fa';

interface KeypadProps {
  onPress: (value: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ onPress }) => {
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([]);

  // 숫자 섞는 함수
  const shuffleArray = (array: number[]) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  // 마운트 시 키패드 레이아웃 생성
  useEffect(() => {
    // 0부터 9까지의 숫자를 무작위로 섞습니다.
    const allNumbers = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // 9의 위치를 찾아 임시로 배열에서 제거합니다.
    const nineIndex = allNumbers.indexOf(9);
    const numbersWithoutNine = allNumbers.filter(num => num !== 9);

    // 9를 제외한 9개의 숫자를 렌더링하고,
    // 마지막 세 번째 자리에 9를 고정시키기 위해 배열을 재구성합니다.
    const finalLayout = [...numbersWithoutNine];
    
    setShuffledNumbers(finalLayout);
  }, []);

  return (
    <div className={styles.keypad}>
      {/* 0~8 숫자 버튼들 렌더링 (총 9개) */}
      {shuffledNumbers.slice(0, 9).map((num, index) => (
        <button
          key={num}
          className={styles.key}
          onClick={() => onPress(num.toString())}
        >
          {num}
        </button>
      ))}

      {/* 전체삭제 버튼을 맨 왼쪽 아래에 배치 */}
      <button className={styles.deleteAll} onClick={() => onPress('전체삭제')}>전체삭제</button>
      
      {/* 숫자 9 버튼을 맨 아래 중간에 고정 */}
      <button className={styles.key} onClick={() => onPress('9')}>9</button>

      {/* 삭제 버튼을 맨 오른쪽 아래에 배치 */}
      <button className={styles.delete} onClick={() => onPress('삭제')}><FaBackspace /></button>
    </div>
  );
};

export default Keypad;