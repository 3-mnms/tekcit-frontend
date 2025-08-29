import React, { useMemo, useRef, useState, useEffect } from 'react';
import Button from '@/components/common/button/Button';
import styles from './FamilyCertUploadInline.module.css';

type Props = {
  /** 확정된 파일을 부모에 알려주고 싶으면 사용 */
  onChange?: (file: File | null) => void;
  accept?: string; // 기본: 이미지 + PDF
  label?: string;  // 좌측 라벨 텍스트
};

const FamilyCertUploadInline: React.FC<Props> = ({
  onChange,
  accept = 'image/*,application/pdf',
  label = '가족증명서',
}) => {
  // 확정된 파일(읽기전용 인풋에 표시)
  const [file, setFile] = useState<File | null>(null);

  // 모달에서 임시로 보는 파일
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tempUrl = useMemo(
    () => (tempFile ? URL.createObjectURL(tempFile) : ''),
    [tempFile]
  );

  useEffect(() => {
    return () => {
      if (tempUrl) URL.revokeObjectURL(tempUrl);
    };
  }, [tempUrl]);

  const isImage = tempFile?.type.startsWith('image/');
  const isPDF = tempFile?.type === 'application/pdf';

  const pick = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setTempFile(f);
    setOpen(true);
    setLoading(true);          // 모달 로딩 표시
    e.currentTarget.value = ''; // 같은 파일 재선택 가능
  };

  const confirm = () => {
    setFile(tempFile);
    onChange?.(tempFile ?? null);
    setOpen(false);
  };

  const cancel = () => {
    setTempFile(null);
    setOpen(false);
  };

  return (
    <div className={styles.container}>
      {/* 한 줄 폼 영역: 라벨 + 읽기전용 인풋 + 버튼 */}
      <div className={styles.row}>
        <label className={styles.label}>{label}</label>

        <input
          readOnly
          value={file ? file.name : ''}
          placeholder="ID 검색 또는 첨부를 통해서만 채워짐"
          className={styles.readonlyInput}
        />

        <div className={styles.actions}>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={onFileChange}
            className={styles.hiddenInput}
          />
          <Button className={styles.primaryBtn} onClick={pick}>
            첨부파일 선택
          </Button>
          {file && (
            <Button
              className={styles.neutralBtn}
              onClick={() => {
                setFile(null);
                onChange?.(null);
              }}
            >
              제거
            </Button>
          )}
        </div>
      </div>

      {/* 모달 */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className={styles.dialogOverlay}
        >
          <div className={styles.dialog}>
            {/* 헤더: 안내 텍스트 */}
            <div className={styles.header}>첨부파일 등록 • 로딩창</div>

            {/* 미리보기 박스 */}
            <div className={styles.previewBox}>
              <div className={styles.previewArea}>
                {isImage && (
                  <img
                    src={tempUrl}
                    alt="가족증명서 미리보기"
                    className={styles.previewImg}
                    onLoad={() => setLoading(false)}
                  />
                )}

                {isPDF && (
                  <iframe
                    title="가족증명서 미리보기"
                    src={tempUrl}
                    className={styles.pdfFrame}
                    onLoad={() => setLoading(false)}
                  />
                )}

                {!isImage && !isPDF && tempFile && (
                  <div className={styles.previewUnsupported}>
                    <p>미리보기를 지원하지 않는 형식이에요.</p>
                    <p className={styles.previewUnsupportedName}>{tempFile.name}</p>
                  </div>
                )}

                {/* 로딩창 오버레이 */}
                {loading && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.loadingCard}>로 딩 창</div>
                  </div>
                )}
              </div>
            </div>

            {/* 하단 버튼(확인/취소) */}
            <div className={styles.footer}>
              <Button className={styles.primaryBtn} onClick={confirm}>
                확인
              </Button>
              <Button className={styles.neutralBtn} onClick={cancel}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyCertUploadInline;
