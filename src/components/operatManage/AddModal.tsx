import React, { useState } from 'react';
import styles from './AddModal.module.css';

export interface NewPartnerData {
    userId: string;
    name: string;
    phone: string;
    email: string;
    genre: string;
    businessName: string;
    pw?: string;
}

interface AddPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPartner: NewPartnerData) => void;
}

const AddPartnerModal: React.FC<AddPartnerModalProps> = ({ isOpen, onClose, onSave }) => {
    // 삐약! 입력 필드의 상태를 관리합니다!
    const [partnerData, setPartnerData] = useState<NewPartnerData>({
        userId: '',
        name: '',
        phone: '',
        email: '',
        genre: '',
        businessName: '',
        pw: '',
    });

    if (!isOpen) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPartnerData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

     const handleSave = () => {
        // 삐약! 필요한 필드가 모두 채워졌는지 유효성 검사를 합니다!
        if (!partnerData.userId || !partnerData.name || !partnerData.pw) {
            alert('삐약! 필수 정보를 모두 입력해주세요!');
            return;
        }
        onSave(partnerData);
        onClose(); // 삐약! 저장 후 모달을 닫습니다!
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2 className={styles.modalTitle}>파트너 추가</h2>
                <div className={styles.formGroup}>
                    <label htmlFor="userId">계정(아이디)</label>
                    <input type="text" id="userId" name="userId" value={partnerData.userId} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="pw">비밀번호</label>
                    <input type="password" id="pw" name="pw" value={partnerData.pw} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="name">이름</label>
                    <input type="text" id="name" name="name" value={partnerData.name} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">이메일</label>
                    <input type="email" id="email" name="email" value={partnerData.email} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="phone">전화번호</label>
                    <input type="tel" id="phone" name="phone" value={partnerData.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="genre">장르</label>
                    <input type="text" id="genre" name="genre" value={partnerData.genre} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="businessName">사업자명</label>
                    <input type="text" id="businessName" name="businessName" value={partnerData.businessName} onChange={handleChange} />
                </div>
                <div className={styles.buttonGroup}>
                    <button onClick={handleSave} className={styles.saveButton}>저장</button>
                    <button onClick={onClose} className={styles.cancelButton}>취소</button>
                </div>
            </div>
        </div>
    );
};

export default AddPartnerModal;