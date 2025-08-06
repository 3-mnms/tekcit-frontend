import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Input from '@components/shared/Input';
import DatePicker from '@components/shared/DatePicker';
import Button from '@components/common/Button';
import PostcodeSearch from '@/components/host/ProductRegist/PostcodeSearch';
import styles from './ProductRegistPage.module.css';

interface ConfirmModalState {
    isOpen: boolean;
    onConfirm: () => void;
}

const ProductRegisterPage: React.FC = () => {
    const [productData, setProductData] = useState({
        productName: '',
        subTitle: '',
        genre: '',
        ageRating: '',
        venueName: '',
        venueAddress: '', // 삐약! 이 필드에 주소가 들어갑니다!
        startDate: '',
        endDate: '',
        startTime:'',
        endTime:'',
        runningTime: '',
        intermission: '',
        price: '',
        maxPurchase: '제한 없음',
        ticketMethod: '일괄 배송',
        description: '',
        posterFile: null as File | null,
        detailImageFiles: [] as File[],
    });

    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        onConfirm: () => {},
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    // 삐약! PostcodeSearch 컴포넌트에서 주소를 받아올 함수를 추가합니다!
    const handleAddressComplete = (address: string) => {
        setProductData(prevData => ({
            ...prevData,
            venueAddress: address,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    if (name === 'posterFile') {
        // 삐약! 포스터 파일은 하나만 추가해야 하니 기존 로직 유지!
        setProductData(prevData => ({ ...prevData, posterFile: files[0] }));
    } else if (name === 'detailImageFiles') {
        // 삐약! 상세 정보 이미지는 여러 개를 따로 추가할 수 있도록 수정합니다!
        const newFiles = Array.from(files);
        setProductData(prevData => ({ 
            ...prevData, 
            detailImageFiles: [...prevData.detailImageFiles, ...newFiles] 
        }));
    }
};
    
    const handleRemoveDetailImage = (fileNameToRemove: string) => {
    setProductData(prevData => ({
        ...prevData,
        detailImageFiles: prevData.detailImageFiles.filter(file => file.name !== fileNameToRemove),
    }));
    };
    const handleRegisterClick = () => {
        if (!productData.productName) {
            alert('삐약! 상품명을 입력해주세요!');
            return;
        }

        setConfirmModal({
            isOpen: true,
            onConfirm: handleFinalRegister,
        });
    };
    
    const handleFinalRegister = () => {
        console.log('상품 등록 데이터:', productData);
        alert('상품이 성공적으로 등록되었습니다!');
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    const handleCloseModal = () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    return (
        <Layout subTitle="상품 등록">
            <div className={styles.container}>
                <div className={styles.header}>
                    <p className={styles.infoText}>*** 제공된 템플릿에 맞춰 입력해주세요 ***</p>
                </div>
                <form>
                    <div className={styles.formSection}>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <Input 
                                    label="1. 상품명" 
                                    type="text" 
                                    name="productName" 
                                    placeholder="상품명을 입력하세요." 
                                    value={productData.productName} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>2. 상품 장르</label>
                                <select name="genre" className={styles.select} value={productData.genre} onChange={handleChange}>
                                    <option value="">선택해주세요</option>
                                    <option value="뮤지컬">뮤지컬</option>
                                    <option value="대중음악">대중음악(콘서트)</option>
                                    <option value="연극">연극</option>
                                    <option value="한국음악">한국음악(국악)</option>
                                    <option value="서양음악">서양음악(클래식)</option>
                                </select>
                            </div>
                            <div className={styles.formItem}>
                                <label>3. 관람 등급</label>
                                <select name="ageRating" className={styles.select} value={productData.ageRating} onChange={handleChange}>
                                    <option value="">선택해주세요</option>
                                    <option value="전체">전체</option>
                                    <option value="12세 이상">12세 이상</option>
                                    <option value="15세 이상">15세 이상</option>
                                    <option value="19세 이상">19세 이상</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <Input 
                                    label="4. 공연장" 
                                    type="text" 
                                    name="venueName" 
                                    placeholder="공연장을 작성해주세요" 
                                    value={productData.venueName} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                <PostcodeSearch 
                                    label="공연장 주소"
                                    onComplete={handleAddressComplete}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <DatePicker 
                                    label="5. 공연 일시" 
                                    name="startDate" 
                                    value={productData.startDate} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                    <DatePicker 
                                        label="종료일" 
                                        name="endDate" 
                                        value={productData.endDate} 
                                        onChange={handleChange} 
                                    />
                            </div>
                            <div className={styles.formItem}>
                                <Input 
                                    label="6. 공연 시간" 
                                    type="time" 
                                    name="startTime" 
                                    value={productData.startTime} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                <Input 
                                    label="공연 종료 시간" 
                                    type="time"
                                    name="endTime"
                                    value={productData.endTime}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <Input 
                                    label="7. 가격" 
                                    type="number" 
                                    name="price" 
                                    placeholder="선택해주세요" 
                                    value={productData.price} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                <label>8. 구매 매수 제한</label>
                                <div className={styles.radioGroup}>
                                    <label><input type="radio" name="maxPurchase" value="1장" checked={productData.maxPurchase === '1장'} onChange={handleChange} /> 1장</label>
                                    <label><input type="radio" name="maxPurchase" value="2장" checked={productData.maxPurchase === '2장'} onChange={handleChange} /> 2장</label>
                                    <label><input type="radio" name="maxPurchase" value="3장" checked={productData.maxPurchase === '3장'} onChange={handleChange} /> 3장</label>
                                    <label><input type="radio" name="maxPurchase" value="4장" checked={productData.maxPurchase === '4장'} onChange={handleChange} /> 4장</label>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>9. 고객 티켓 수령 방법</label>
                                <div className={styles.radioGroup}>
                                    <label><input type="radio" name="maxPurchase" value="일괄 배송" checked={productData.maxPurchase === '일괄 배송'} onChange={handleChange} /> 일괄 배송</label>
                                    <label><input type="radio" name="maxPurchase" value="현장 수령(QR)" checked={productData.maxPurchase === '현장 수령(QR)'} onChange={handleChange} /> 현장 수령(QR)</label>
                                    <label><input type="radio" name="maxPurchase" value="배송&현장 수령(QR)" checked={productData.maxPurchase === '배송&현장 수령(QR)'} onChange={handleChange} /> 배송&현장 수령(QR)</label>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <div className={styles.fileUploadItem}>
                                    <label>10-1. 포스터 이미지</label>
                                    <Input 
                                        type="file"
                                        name="posterFile"
                                        onChange={handleFileChange}
                                        // 삐약! 파일을 한 개만 받습니다!
                                    />
                                    {productData.posterFile && <span className={styles.fileName}>{productData.posterFile.name}</span>}
                                </div>
                                {/* 2. 상세 정보 입력 */}
                                <div className={styles.fileUploadItem}>
                                    <label>10-2. 작품 설명</label>
                                    <textarea 
                                        name="description" 
                                        className={styles.textarea} 
                                        value={productData.description} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                {/* 3. 상세 정보 이미지 업로드 */}
                                <div className={styles.fileUploadItem}>
                                    <label>10-3. 상세 정보 이미지</label>
                                    <Input 
                                        type="file"
                                        name="detailImageFiles"
                                        onChange={handleFileChange}
                                        multiple // 삐약! 여러 파일을 받을 수 있게 합니다!
                                    />
                                    {productData.detailImageFiles.length > 0 && (
                                        <div className={styles.fileNames}>
                                            {productData.detailImageFiles.map(file => (
                                                <div key={file.name} className={styles.fileNameWrapper}>
                                                    <span className={styles.fileName}>{file.name}</span>
                                                    {/* 삐약! 삭제 버튼을 추가합니다! */}
                                                    <button
                                                        type="button"
                                                        className={styles.removeFileButton}
                                                        onClick={() => handleRemoveDetailImage(file.name)}
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <div className={styles.registerButtonWrapper}>
                    <Button onClick={handleRegisterClick}>등록하기</Button>
                </div>
            </div>
            
            {confirmModal.isOpen && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <p className={styles.modalText}>정말로 상품을 등록하시겠습니까?</p>
                        <div className={styles.modalButtons}>
                            <Button onClick={confirmModal.onConfirm} className={styles.confirmButton}>등록하기</Button>
                            <Button onClick={handleCloseModal} className={styles.cancelButton}>취소</Button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProductRegisterPage;