import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Input from '@/components/shared/Input';
import DatePicker from '@components/shared/DatePicker';
import Button from '@components/common/Button';
import PostcodeSearch from '@/components/product/PostcodeSearch';
import ScheduleDropdown from '@/components/product/ScheduleDropdown';
import {initialProductData } from '@/models/Product';
import type {ProductType} from '@/models/Product';
import CastInput from '@/components/product/CastInput';
import styles from './ProductRegistPage.module.css';

import { createProduct } from '@/shared/api/products';

interface ConfirmModalState {
    isOpen: boolean;
    onConfirm: () => void;  
}

const ProductRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [productData, setProductData] = useState<ProductType>(initialProductData);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        onConfirm: () => {},
    });

     // 삐약! 상품 등록을 위한 useMutation 훅을 사용합니다!
    const { mutate, isPending } = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            // 삐약! 상품 등록이 성공하면 이 함수가 실행됩니다!
            queryClient.invalidateQueries({ queryKey: ['products'] }); // 'products' 쿼리 캐시를 무효화해서 상품 목록을 새로고침합니다!
            setConfirmModal({ ...confirmModal, isOpen: false });
            alert('상품이 성공적으로 등록되었습니다!'); // 삐약! alert을 띄우고
            navigate('/productManage'); // 삐약! 상품 관리 페이지로 이동합니다!
        },
        onError: (error) => {
            // 삐약! 등록 실패 시 오류를 처리합니다!
            console.error('상품 등록 실패:', error);
            alert('상품 등록에 실패했습니다. 다시 시도해 주세요.');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddCast = (fcast: string) => {
        setProductData(prevData => ({
            ...prevData,
            fcast: [...prevData.fcast, fcast],
        }));
    };

    const handleRemoveCast = (fcast: string) => {
        setProductData(prevData => ({
            ...prevData,
            fcast: prevData.fcast.filter(fcastMember => fcastMember !== fcast),
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
            onConfirm: () => mutate(productData),
        });
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
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formSection}>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <Input 
                                    label="1. 상품명" 
                                    type="string" 
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
                                    type="string" 
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
                                    type="string" 
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
                                        type="string"
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
                                    type="string" 
                                    name="ticketPrice" 
                                    placeholder="선택해주세요" 
                                    value={productData.ticketPrice} 
                                    onChange={handleChange} 
                                /><p className={styles.unit}>원</p>
                            </div>
                            <div className={styles.formItem}>
                                <label>10. 출연진</label>
                                <CastInput
                                    casts={productData.fcast}
                                    onAddCast={handleAddCast}
                                    onRemoveCast={handleRemoveCast}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>11. 구매 매수 제한</label>
                                <div className={styles.radioGroup}>
                                    <label><input type="radio" name="maxPurchase" value="1장" checked={productData.maxPurchase === '1장'} onChange={handleChange} /> 1장</label>
                                    <label><input type="radio" name="maxPurchase" value="2장" checked={productData.maxPurchase === '2장'} onChange={handleChange} /> 2장</label>
                                    <label><input type="radio" name="maxPurchase" value="3장" checked={productData.maxPurchase === '3장'} onChange={handleChange} /> 3장</label>
                                    <label><input type="radio" name="maxPurchase" value="4장" checked={productData.maxPurchase === '4장'} onChange={handleChange} /> 4장</label>
                                </div>
                            </div>
                            <div className={styles.formItem}>
                                <label>12. 고객 티켓 수령 방법</label>
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
                                    <label>13-1. 포스터 이미지</label>
                                    <Input 
                                        type="file"
                                        name="posterFile"
                                        onChange={handleFileChange}
                                    />
                                    {productData.posterFile && <span className={styles.fileName}>{productData.posterFile.name}</span>}
                                </div>
                                {/* 2. 상세 정보 입력 */}
                                <div className={styles.fileUploadItem}>
                                    <label>13-2. 작품 설명</label>
                                    <textarea 
                                        name="story" 
                                        className={styles.textarea} 
                                        value={productData.story} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                {/* 3. 상세 정보 이미지 업로드 */}
                                <div className={styles.fileUploadItem}>
                                    <label>13-3. 상세 정보 이미지</label>
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
                    <Button onClick={handleRegisterClick} disabled={isPending}>
                        {isPending ? '등록 중...' : '등록하기'}
                    </Button>
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