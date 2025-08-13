import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams  } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useMutation, useQueryClient, useQuery} from '@tanstack/react-query';
import Input from '@/components/shared/Input';
import DatePicker from '@components/shared/DatePicker';
import Button from '@components/common/Button';
import PostcodeSearch from '@/components/product/PostcodeSearch';
import ScheduleDropdown from '@/components/product/ScheduleDropdown';
import {initialProductData, type Festival} from '@/models/festival';
import CastInput from '@/components/product/CastInput';
import { createProduct, getProductDetail, updateProduct } from '@/shared/api/festival';

import styles from './ProductRegistPage.module.css';

interface ConfirmModalState {
    isOpen: boolean;
    onConfirm: () => void;  
}

const ProductRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [isEditMode, setIsEditMode] = useState(false);
    const fid = searchParams.get('id');

    
    const { data: existingProduct } = useQuery({
        queryKey: ['festival', fid],
        queryFn: () => getProductDetail(Number(fid)),
    });
    
    const [productData, setProductData] = useState<Festival>(initialProductData);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [contentFiles, setContentFiles] = useState<File[]>([]);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, onConfirm: () => {} });

    useEffect(() => {
        if (existingProduct) {
            setProductData(existingProduct);
            setIsEditMode(true); // 삐약! 수정 모드로 전환합니다!
        } else {
            setIsEditMode(false);
            setProductData(initialProductData); // 삐약! 수정 모드가 아니면 초기화합니다!
        }
    }, [existingProduct]);

    const { mutate, isPending } = useMutation({
        mutationFn: (data: Festival) => {
            if (isEditMode) {
                return updateProduct(Number(fid), data);
            }
            return createProduct(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setConfirmModal({ ...confirmModal, isOpen: false });
            alert(`상품이 성공적으로 ${isEditMode ? '수정' : '등록'}되었습니다!`);
            navigate('/productManage');
        },
        onError: (error) => {
            console.error('상품 등록/수정 실패:', error);
            alert(`상품 ${isEditMode ? '수정' : '등록'}에 실패했습니다. 다시 시도해 주세요.`);
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
            detail: {
            ...prevData.detail,
            fcast: [...(prevData.detail.fcast as string[]), fcast],
        }
        }));
    };

    const handleRemoveCast = (castToRemove: string) => {
    setProductData(prevData => {
        const currentFcastArray = prevData.detail.fcast as string[];
        const newFcastArray = currentFcastArray.filter(member => member !== castToRemove);
            return {
                ...prevData,
                detail: {
                    ...prevData.detail,
                    fcast: newFcastArray,
                }
            };
        });
    };
        
    const handleAddressComplete = (address: string) => {
        setProductData(prevData => ({
            ...prevData,
            faddress: address,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
        if (!files || files.length === 0) return;

        if (name === 'posterFile') {
            setPosterFile(files[0]);
        } 
        else if (name === 'contentFile') {
            setContentFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
        }
    };
    
    const handleRemoveDetailImage = (fileNameToRemove: string) => {
        setContentFiles(prevFiles => 
        prevFiles.filter(file => file.name !== fileNameToRemove)
        );
    };

    const handleAddSchedule = (day: string, time: string) => {
        const isDuplicate = productData.schedules.some(
            (schedule) => schedule.dayOfWeek === day && schedule.time === time
        );
        if (!isDuplicate) {
            setProductData((prevData) => ({
                ...prevData,
                festivalSchedules: [...prevData.schedules, { dayOfWeek: day, time: time }],
            }));
        }else {
        alert('삐약! 이미 등록된 스케줄이에요!');
    }
    };

    const handleRemoveSchedule = (indexToRemove: number) => {
        setProductData((prevData) => ({
            ...prevData,
            festivalSchedules: prevData.schedules.filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleRegisterClick = () => {
        if (!productData.fname) return alert('삐약! 상품명을 입력해주세요!');

        const finalProductData = {
            ...productData,
        };

        setConfirmModal({
            isOpen: true,
            onConfirm: () => mutate(finalProductData),
        });

        const productInfoToSend = {
            ...productData,
            detail: {
                ...productData.detail,
                fcast: (productData.detail.fcast as string[]).join(','),
            }
        };
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
                                <select name="fage" className={styles.select} value={productData.detail.prfage} onChange={handleChange}>
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
                                    schedules={productData.festivalSchedules}
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
                                    value={productData.detail.runningTime} 
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
                                        value={productData.detail.availableNOP}
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
                                    value={productData.detail.ticketPrice} 
                                    onChange={handleChange} 
                                    suffixText="원"
                                />
                            </div>
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formItem}>
                                <label>10. 출연진</label>
                                <CastInput
                                    fcasts={Array.isArray(productData.detail.fcast) ? productData.detail.fcast : []}
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
                            <div className={styles.formItem}>
                                <label>13. 사업자명</label>
                                <Input 
                                    type="string" 
                                    name="businessName" 
                                    placeholder="상품명을 입력하세요." 
                                    value={productData.detail.entrpsnmH} 
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
                                        value={productData.detail.story} 
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