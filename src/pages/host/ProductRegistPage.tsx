import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Input from '@components/shared/Input';
import DatePicker from '@components/shared/DatePicker';
import Button from '@components/common/Button';
import PostcodeSearch from '@/components/host/ProductRegist/PostcodeSearch';
import ScheduleDropdown from '@/components/host/ProductRegist/ScheduleDropdown';
import {initialProductData } from './../../models/Product';
import type {ProductType} from './../../models/Product';
import styles from './ProductRegistPage.module.css';

interface ConfirmModalState {
    isOpen: boolean;
    onConfirm: () => void;
}

const ProductRegisterPage: React.FC = () => {
    const [productData, setProductData] = useState<ProductType>(initialProductData);
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
    
    const handleAddressComplete = (address: string) => {
        setProductData(prevData => ({
            ...prevData,
            faddress: address,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (!files) return;

        if (name === 'posterFile') {
            setProductData(prevData => ({ ...prevData, posterFile: files[0] }));
        } else if (name === 'contentFile') {
            const newFiles = Array.from(files);
            setProductData(prevData => ({ 
                ...prevData, 
                contentFile: [...prevData.contentFile, ...newFiles] 
            }));
        }
    };
    
    const handleRemoveDetailImage = (fileNameToRemove: string) => {
        setProductData(prevData => ({
            ...prevData,
            contentFile: prevData.contentFile.filter(file => file.name !== fileNameToRemove),
        }));
    };

    const handleAddSchedule = (day: string, time: string) => {
        const isDuplicate = productData.festivalSchedules.some(
            (schedule) => schedule.dayOfWeek === day && schedule.time === time
        );
        if (!isDuplicate) {
            setProductData((prevData) => ({
                ...prevData,
                festivalSchedules: [...prevData.festivalSchedules, { dayOfWeek: day, time: time }],
            }));
        }
    };

    const handleRemoveSchedule = (indexToRemove: number) => {
        setProductData((prevData) => ({
            ...prevData,
            festivalSchedules: prevData.festivalSchedules.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleRegisterClick = () => {
        if (!productData.fname) {
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
                                    name="fname" 
                                    placeholder="상품명을 입력하세요." 
                                    value={productData.fname} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>2. 상품 장르</label>
                                <select name="genrenm" className={styles.select} value={productData.genrenm} onChange={handleChange}>
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
                                <select name="fage" className={styles.select} value={productData.fage} onChange={handleChange}>
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
                                    name="fcltynm" 
                                    placeholder="공연장을 작성해주세요" 
                                    value={productData.fcltynm} 
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
                                    label="5. 공연 시작일" 
                                    name="fdto" 
                                    value={productData.fdto} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                    <DatePicker 
                                        label="종료일" 
                                        name="fdfrom" 
                                        value={productData.fdfrom} 
                                        onChange={handleChange} 
                                    />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>6. 공연 날짜 및 시간</label>
                                <ScheduleDropdown
                                    schedules={productData.festivalSchedules}
                                    onAddSchedule={handleAddSchedule}
                                    onRemoveSchedule={handleRemoveSchedule}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <Input 
                                    label="7. 러닝 타임" 
                                    type="text" 
                                    name="runningTime" 
                                    placeholder="ex) 120분" 
                                    value={productData.runningTime} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                <div className={styles.formItem}>
                                    <Input
                                        label="8. 수용인원"
                                        type="number"
                                        name="availableNOP"
                                        placeholder="수용인원을 입력해주세요"
                                        value={productData.availableNOP}
                                        onChange={handleChange}
                                    />
                                    <p className={styles.unit}>명</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <Input 
                                    label="9. 가격" 
                                    type="number" 
                                    name="ticketPrice" 
                                    placeholder="선택해주세요" 
                                    value={productData.ticketPrice} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                <label>10. 구매 매수 제한</label>
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
                                    <label><input type="radio" name="fticketPick" value="일괄 배송" checked={productData.fticketPick === '일괄 배송'} onChange={handleChange} /> 일괄 배송</label>
                                    <label><input type="radio" name="fticketPick" value="현장 수령(QR)" checked={productData.fticketPick === '현장 수령(QR)'} onChange={handleChange} /> 현장 수령(QR)</label>
                                    <label><input type="radio" name="fticketPick" value="배송&현장 수령(QR)" checked={productData.fticketPick === '배송&현장 수령(QR)'} onChange={handleChange} /> 배송&현장 수령(QR)</label>
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
                                    />
                                    {productData.posterFile && <span className={styles.fileName}>{productData.posterFile.name}</span>}
                                </div>
                                {/* 2. 상세 정보 입력 */}
                                <div className={styles.fileUploadItem}>
                                    <label>10-2. 작품 설명</label>
                                    <textarea 
                                        name="story" 
                                        className={styles.textarea} 
                                        value={productData.story} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                {/* 3. 상세 정보 이미지 업로드 */}
                                <div className={styles.fileUploadItem}>
                                    <label>10-3. 상세 정보 이미지</label>
                                    <Input 
                                        type="file"
                                        name="contentFile"
                                        onChange={handleFileChange}
                                        multiple // 삐약! 여러 파일을 받을 수 있게 합니다!
                                    />
                                    {productData.contentFile.length > 0 && (
                                        <div className={styles.fileNames}>
                                            {productData.contentFile.map(file => (
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