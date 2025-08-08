import styles from './DotDisplay.module.css'

interface DotDisplayProps {
  length: number
}

const DotDisplay: React.FC<DotDisplayProps> = ({ length }) => {
  return (
    <div className={styles.dotContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`${styles.dot} ${i < length ? styles.filled : ''}`}
        />
      ))}
    </div>
  )
}

export default DotDisplay
