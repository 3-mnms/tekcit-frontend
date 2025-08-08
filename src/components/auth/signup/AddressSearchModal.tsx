import React from 'react'
import DaumPostcodeEmbed from 'react-daum-postcode'
import styles from './AddressSearchModal.module.css'

interface AddressSearchModalProps {
  onComplete: (data: { zonecode: string; address: string }) => void
  onClose: () => void
}

const AddressSearchModal: React.FC<AddressSearchModalProps> = ({ onComplete, onClose }) => {
  const handleComplete = (data: any) => {
    onComplete({
      zonecode: data.zonecode,
      address: data.roadAddress || data.jibunAddress,
    })
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeBtn}>
          ×
        </button>
        <DaumPostcodeEmbed onComplete={handleComplete} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  )
}

export default AddressSearchModal
