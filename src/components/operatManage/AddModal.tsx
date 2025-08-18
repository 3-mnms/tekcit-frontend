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
        genre: string;
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
            genre: '',
        },
    });

    if (!isOpen) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (['businessName', 'genre'].includes(name)) {
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
                <h2 className={styles.modalTitle}>파트너 추가</h2>
                <div className={styles.formGroup}>
                    <label htmlFor="loginId">계정(아이디)</label>
                    <input type="text" id="loginId" name="loginId" value={hostData.loginId} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="loginPw">비밀번호</label>
                    <input type="password" id="loginPw" name="loginPw" value={hostData.loginPw} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="name">이름</label>
                    <input type="text" id="name" name="name" value={hostData.name} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">이메일</label>
                    <input type="email" id="email" name="email" value={hostData.email} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="phone">전화번호</label>
                    <input type="tel" id="phone" name="phone" value={hostData.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="genre">장르</label>
                    <input type="text" id="genre" name="genre" value={hostData.hostProfile.genre} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="businessName">사업자명</label>
                    <input type="text" id="businessName" name="businessName" value={hostData.hostProfile.businessName} onChange={handleChange} />
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