import React, { useState, useEffect } from 'react';
import { useNavigate, useParams  } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useMutation, useQueryClient, useQuery} from '@tanstack/react-query';
import Input from '@/components/shared/Input';
import DatePicker from '@components/shared/DatePicker';
import Button from '@components/common/Button';
import PostcodeSearch from '@/components/product/PostcodeSearch';
import ScheduleDropdown from '@/components/product/ScheduleDropdown';
import {initialProductData, type Festival, type DayOfWeek} from '@/models/admin/host/festival';
import CastInput from '@/components/product/CastInput';
import { createProduct, getProductDetail, updateProduct } from '@/shared/api/admin/host/festival';

import styles from './ProductRegistPage.module.css';

interface ConfirmModalState {
    isOpen: boolean;
    onConfirm: () => void;  
}

const ProductRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id: fid } = useParams<{ id: string }>();
    const isEditMode = !!fid;
    
    console.log('Step 1: ID from URL:', fid);

    const [productData, setProductData] = useState<Festival>(initialProductData);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [contentFiles, setContentFiles] = useState<File[]>([]);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, onConfirm: () => {} });
    
    const { data: existingProduct } = useQuery({
        queryKey: ['festival', fid],
        queryFn: () => getProductDetail(fid!),
        enabled: isEditMode,
        select: (response) => {
            const product = response.data; // API 응답에서 실제 데이터 객체 꺼내기
            return {
                ...product,
                // fcast가 문자열이면 쉼표로 나눠서 배열로 변환!
                fcast: typeof product.fcast === 'string'
                    ? product.fcast.split(',').map(s => s.trim())
                    : [],
            };
        }
    });
    console.log('Step 2: Data from useQuery:', existingProduct);

    useEffect(() => {
         console.log('Step 3: useEffect is running. existingProduct is:', existingProduct);
        if (isEditMode && existingProduct) {
            setProductData(existingProduct);
        } else {
            setProductData(initialProductData);
        }
    }, [isEditMode, existingProduct]);

    const { mutate, isPending } = useMutation({
        mutationFn: (formData: FormData) => isEditMode ? updateProduct(fid!, formData) : createProduct(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['festival'] });
            alert(`상품이 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다!`);
            navigate('/admin/productManage');
        },
        onError: (error) => {
            console.error('상품 등록/수정 실패:', error);
            alert(`상품 ${isEditMode ? '수정' : '등록'}에 실패했습니다.`);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['ticketPrice', 'maxPurchase', 'availableNOP', 'ticketPick'].includes(name);
        setProductData(p => ({ ...p, [name]: isNumeric ? (value === '' ? '' : Number(value)) : value }));
    };

    const handleAddCast = (cast: string) => {
        setProductData(p => ({ ...p, fcast: [...(p.fcast as string[]), cast] }));
    };

    const handleRemoveCast = (castToRemove: string) => {
        setProductData(p => ({ ...p, fcast: (p.fcast as string[]).filter(c => c !== castToRemove) }));
    };
        
    const handleAddressComplete = (address: string) => {
        setProductData(p => ({ ...p, faddress: address }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (!files) return;
        if (name === 'posterFile') setPosterFile(files[0] || null);
        else if (name === 'contentFiles') setContentFiles(prev => [...prev, ...Array.from(files)]);
    };
    
    const handleRemoveDetailImage = (fileNameToRemove: string) => {
        setContentFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
    };

    const handleAddSchedule = (day: DayOfWeek, time: string) => {
        const newSchedule = { dayOfWeek: day, time };
        if (!productData.schedules.some(s => s.dayOfWeek === day && s.time === time)) {
            setProductData(p => ({ ...p, schedules: [...p.schedules, newSchedule] }));
        }
    }

    const handleRemoveSchedule = (indexToRemove: number) => {
        setProductData(p => ({ ...p, schedules: p.schedules.filter((_, i) => i !== indexToRemove) }));
    };

    const handleRegisterClick = () => {
        if (!productData.fname) return alert('삐약! 상품명을 입력해주세요!');

        setConfirmModal({
            isOpen: true,
            onConfirm: () => {
                const formData = new FormData();

                const productInfoToSend = {
                    ...productData,
                    fcast: Array.isArray(productData.fcast) 
                        ? productData.fcast.join(',') 
                        : productData.fcast,
                };
                
                formData.append('requestDTO', new Blob([JSON.stringify(productInfoToSend)], { type: "application/json" }));
                
                if (posterFile) {
                    formData.append('posterFile', posterFile);
                }
                contentFiles.forEach(file => {
                    formData.append('contentFiles', file);
                });

                mutate(formData);
                handleCloseModal();
            },
        });
    };

    const handleCloseModal = () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
    };

    return (
        <Layout subTitle={isEditMode ? '상품 수정' : '상품 등록'}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <p className={styles.infoText}>*** 제공된 템플릿에 맞춰 입력해주세요 ***</p>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formSection}>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>1. 상품명</label>
                                <Input 
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
                                <select name="prfage" className={styles.select} value={productData.prfage} onChange={handleChange}>
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
                                <label>4. 공연장</label>
                                <Input 
                                    type="string" 
                                    name="fcltynm" 
                                    placeholder="공연장을 작성해주세요" 
                                    value={productData.fcltynm} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                <label>공연장 주소</label>
                                <PostcodeSearch 
                                    onComplete={handleAddressComplete}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>5. 공연 시작일</label>
                                <DatePicker 
                                    name="fdto" 
                                    value={productData.fdto} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className={styles.formItem}>
                                <label>종료일</label>
                                <DatePicker 
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
                                    schedules={productData.schedules}
                                    onAddSchedule={handleAddSchedule}
                                    onRemoveSchedule={handleRemoveSchedule}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>7. 러닝 타임</label>
                                <Input 
                                    type="string" 
                                    name="runningTime" 
                                    placeholder="ex) 120" 
                                    value={productData.runningTime} 
                                    onChange={handleChange} 
                                    suffixText="분"
                                />
                            </div>
                            <div className={styles.formItem}>
                                <div className={styles.formItem}>
                                    <label>8. 수용인원</label>
                                    <Input
                                        type="string"
                                        name="availableNOP"
                                        placeholder="수용인원을 입력해주세요"
                                        value={productData.availableNOP}
                                        onChange={handleChange}
                                        suffixText="명"
                                    />
                                </div>
                            </div>
                            <div className={styles.formItem}>
                                <label>9. 가격</label>
                                <Input 
                                    type="string" 
                                    name="ticketPrice" 
                                    placeholder="선택해주세요" 
                                    value={productData.ticketPrice} 
                                    onChange={handleChange} 
                                    suffixText="원"
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>10. 출연진</label>
                                <CastInput
                                    fcasts={Array.isArray(productData.fcast) ? productData.fcast : []}
                                    onAddCast={handleAddCast}
                                    onRemoveCast={handleRemoveCast}
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>11. 구매 매수 제한</label>
                                <div className={styles.radioGroup}>
                                    <label><input type="radio" name="maxPurchase" value={1} checked={productData.maxPurchase === 1} onChange={handleChange} /> 1장</label>
                                    <label><input type="radio" name="maxPurchase" value={2} checked={productData.maxPurchase === 2} onChange={handleChange} /> 2장</label>
                                    <label><input type="radio" name="maxPurchase" value={3} checked={productData.maxPurchase === 3} onChange={handleChange} /> 3장</label>
                                    <label><input type="radio" name="maxPurchase" value={4} checked={productData.maxPurchase === 4} onChange={handleChange} /> 4장</label>
                                </div>
                            </div>
                            <div className={styles.formItem}>
                                <label>12. 고객 티켓 수령 방법</label>
                                <div className={styles.radioGroup}>
                                    <label><input type="radio" name="fticketPick" value={1} checked={productData.ticketPick === 1} onChange={handleChange} /> 일괄 배송</label>
                                    <label><input type="radio" name="fticketPick" value={2} checked={productData.ticketPick === 2} onChange={handleChange} /> 현장 수령(QR)</label>
                                    <label><input type="radio" name="fticketPick" value={3} checked={productData.ticketPick === 3} onChange={handleChange} /> 배송&현장 수령(QR)</label>
                                </div>
                            </div>
                        </div>
                            <div className={styles.formItem}>
                                <label>13. 기획사명</label>
                                <Input 
                                    type="string" 
                                    name="entrpsnmH" 
                                    placeholder="상품명을 입력하세요." 
                                    value={productData.entrpsnmH} 
                                    onChange={handleChange} 
                                />
                            </div>
                        <div className={styles.formRow}>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <div className={styles.fileUploadItem}>
                                    <label>14-1. 포스터 이미지</label>
                                    <Input 
                                        type="file"
                                        name="posterFile"
                                        onChange={handleFileChange}
                                    />
                                    {posterFile && <span className={styles.fileName}>{posterFile.name}</span>}
                                </div>
                                {/* 2. 상세 정보 입력 */}
                                <div className={styles.fileUploadItem}>
                                    <label>14-2. 작품 설명</label>
                                    <textarea 
                                        name="story" 
                                        className={styles.textarea} 
                                        value={productData.story} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                {/* 3. 상세 정보 이미지 업로드 */}
                                <div className={styles.fileUploadItem}>
                                    <label>14-3. 상세 정보 이미지</label>
                                    <Input 
                                        type="file"
                                        name="contentFile"
                                        onChange={handleFileChange}
                                        multiple // 삐약! 여러 파일을 받을 수 있게 합니다!
                                    />
                                    {contentFiles.length > 0 && (
                                        <div className={styles.fileNames}>
                                             {contentFiles.map(file => (
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
                <div className="flex justify-center">
                <Button onClick={handleRegisterClick} disabled={isPending} className="w-1/2 h-7" >
                    {isPending ? '처리 중...' : (isEditMode ? '수정하기' : '등록하기')}
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