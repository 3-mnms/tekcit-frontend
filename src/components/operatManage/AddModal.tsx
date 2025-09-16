import React, { useState } from 'react';
import Button from '../common/Button';
import styles from './AddModal.module.css';

export interface NewHostData {
    loginId: string;
    loginPw: string;
    name: string;
    phone: string;
    email: string;
    hostProfile: {
        businessName: string;
    };
}

interface AddHostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newHost: NewHostData) => void;
    isPending: boolean;
}

const AddModal: React.FC<AddHostModalProps> = ({ isOpen, onClose, onSave }) => {
    // 삐약! 입력 필드의 상태를 관리합니다!
    const [hostData, setHostData] = useState<NewHostData>({
        loginId: '',
        loginPw: '',
        name: '',
        phone: '',
        email: '',
        hostProfile: {
            businessName: '',
        },
    });

    if (!isOpen) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // 삐약! 전화번호 입력 필드에만 자동 하이픈 기능을 적용해요!
        if (name === 'phone') {
            const onlyNumbers = value.replace(/[^0-9]/g, ''); // 삐약! 숫자만 남겨요!
            let formattedValue = '';
            
            if (onlyNumbers.length < 4) {
                formattedValue = onlyNumbers;
            } else if (onlyNumbers.length < 8) {
                formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3)}`;
            } else {
                formattedValue = `${onlyNumbers.slice(0, 3)}-${onlyNumbers.slice(3, 7)}-${onlyNumbers.slice(7, 11)}`;
            }
            
            setHostData(prevData => ({ ...prevData, phone: formattedValue }));
        } else if (name === 'businessName') {
            setHostData(prevData => ({
                ...prevData,
                hostProfile: {
                    ...prevData.hostProfile,
                    [name]: value,
                },
            }));
        } else {
            setHostData(prevData => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

     const handleSave = () => {
        if (!hostData.loginId || !hostData.loginPw || !hostData.name) {
            alert('삐약! 필수 정보를 모두 입력해주세요!');
            return;
        }
        onSave(hostData);
        onClose();
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2 className={styles.modalTitle}>파트너 계정 등록</h2>
                <p className={styles.modalSubtitle}>새로운 파트너의 계정 정보를 입력해주세요.</p>
                <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                        <label htmlFor="loginId">계정(아이디)</label>
                        <input type="text" id="loginId" name="loginId" value={hostData.loginId} onChange={handleChange} placeholder="아이디를 입력하세요."/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="loginPw">비밀번호</label>
                        <input type="password" id="loginPw" name="loginPw" value={hostData.loginPw} onChange={handleChange} placeholder="비밀번호를 입력하세요." />
                    </div>
                </div>
                <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">이름</label>
                        <input type="text" id="name" name="name" value={hostData.name} onChange={handleChange} placeholder="파트너의 이름을 입력하세요."/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="businessName">사업자명</label>
                        <input type="text" id="businessName" name="businessName" value={hostData.hostProfile.businessName} onChange={handleChange} placeholder="사업자명을 입력하세요."/>
                    </div>
                </div>
                <div className={styles.formSection}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">이메일</label>
                        <input type="email" id="email" name="email" value={hostData.email} onChange={handleChange} placeholder="이메일 주소를 입력하세요."/>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="phone">전화번호</label>
                        <input type="tel" id="phone" name="phone" value={hostData.phone} onChange={handleChange} placeholder="연락처를 입력하세요." maxLength={13}/>
                    </div>
                </div>
                <div className={styles.buttonGroup}>
                    <Button onClick={handleSave} variant="secondary">저장</Button>
                    <Button onClick={onClose} variant="cancel">취소</Button>
                </div>
            </div>
        </div>
    );
};

export default AddModal;