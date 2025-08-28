import React, { useMemo, useRef, useState, useEffect } from 'react';
import styles from './TransferRecipientForm.module.css';
import Button from '@/components/common/button/Button';
import IdSearchPicker, { type AccountMini } from './IdSearchPicker';

type Relation = 'FAMILY' | 'FRIEND' | null;

const TransferRecipientForm: React.FC = () => {
  const [relation, setRelation] = useState<Relation>(null);

  const [loginId, setLoginId] = useState('');  // ✅ readOnly 표시 전용
  const [name, setName] = useState('');        // ✅ 항상 readOnly

  // 확정된 파일
  const [proofFile, setProofFile] = useState<File | null>(null);

  // 모달 미리보기용 임시 상태
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tempUrl = useMemo(() => (tempFile ? URL.createObjectURL(tempFile) : ''), [tempFile]);

  useEffect(() => {
    return () => { if (tempUrl) URL.revokeObjectURL(tempUrl); };
  }, [tempUrl]);

  // 모달 열렸을 때 배경 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev || '';
    return () => { document.body.style.overflow = prev || ''; };
  }, [modalOpen]);

  const isImg = tempFile?.type.startsWith('image/');
  const isPdf = tempFile?.type === 'application/pdf';

  const needProof = relation === 'FAMILY';
  const baseValid = loginId.trim().length > 0 && name.trim().length > 0;
  const canSubmit = baseValid && relation !== null && (!needProof || !!proofFile);

  const pickFile = () => fileInputRef.current?.click();

  const handleFileChange = (f?: File) => {
    if (!f) return;
    setTempFile(f);
    setModalOpen(true);
    setPreviewLoading(true);
  };

  const confirmFile = () => {
    setProofFile(tempFile);
    setModalOpen(false);
  };
  const cancelFile = () => {
    setTempFile(null);
    setModalOpen(false);
  };

  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        alert(relation === 'FAMILY' ? 'UI 데모: 가족 양도 완료!' : 'UI 데모: 결제 단계로 이동!');
      }}
    >
      <h2 className={styles.title}>양도자 선택</h2>

      <div className={styles.radioRow}>
        <label className={styles.radio}>
          <input
            type="radio"
            name="relation"
            value="FAMILY"
            checked={relation === 'FAMILY'}
            onChange={() => setRelation('FAMILY')}
          />
          가족에게
        </label>
        <label className={styles.radio}>
          <input
            type="radio"
            name="relation"
            value="FRIEND"
            checked={relation === 'FRIEND'}
            onChange={() => setRelation('FRIEND')}
          />
          친구에게
        </label>
      </div>

      {/* 아이디는 검색으로만 입력 가능 */}
      <IdSearchPicker
        idValue={loginId}
        onSelect={(acc: AccountMini) => {
          setLoginId(acc.id);
          setName(acc.name);
        }}
        buttonLabel="이메일 검색"
      />

      {/* 이름은 항상 readOnly */}
      <label className={styles.label}>
        이름
        <input
          className={styles.input}
          value={name}
          readOnly
          aria-readonly="true"
          placeholder="이메일 검색으로 자동 채워집니다"
          onKeyDown={(e) => e.preventDefault()}
        />
      </label>

      {relation === 'FAMILY' && (
        <>
          <div className={styles.proofWrap}>
            <span className={styles.proofLabel}>가족증명서</span>

            {/* 숨겨진 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className={styles.fileInput}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.currentTarget.value = ''; // 같은 파일 재선택 허용
                handleFileChange(f);
              }}
            />

            <div className={styles.dropzone}>
              <button type="button" className={styles.fileButton} onClick={pickFile}>
                파일 선택
              </button>
              <span className={styles.fileHelp}>jpg/png/pdf 가능 · 10MB 이하</span>
            </div>
          </div>

          {proofFile && (
            <div className={styles.fileMeta}>
              <span className={styles.fileName}>{proofFile.name}</span>
              <button type="button" className={styles.clearBtn} onClick={() => setProofFile(null)}>
                제거
              </button>
            </div>
          )}
        </>
      )}

      <Button
        type="submit"
        className={`w-full h-12 ${canSubmit ? '' : 'opacity-50 cursor-not-allowed'}`}
        disabled={!canSubmit}
      >
        다음
      </Button>

      {/* ===== 모달 ===== */}
      {modalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalTitle}>첨부파일 등록 · 로딩창</div>

            <div className={styles.previewBox}>
              <div className={styles.previewArea}>
                {isImg && (
                  <img
                    src={tempUrl}
                    alt="가족증명서 미리보기"
                    className={styles.previewImg}
                    onLoad={() => setPreviewLoading(false)}
                  />
                )}
                {isPdf && (
                  <iframe
                    title="가족증명서 미리보기"
                    src={tempUrl}
                    className={styles.previewPdf}
                    onLoad={() => setPreviewLoading(false)}
                  />
                )}
                {!isImg && !isPdf && tempFile && (
                  <div className={styles.previewFallback}>
                    <p>미리보기를 지원하지 않는 형식이에요.</p>
                    <p className={styles.previewFilename}>{tempFile.name}</p>
                  </div>
                )}
                {previewLoading && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.loadingBadge}>로 딩 창</div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalBtns}>
              <Button className="px-4 py-2" onClick={confirmFile}>확인</Button>
              <Button className="px-4 py-2 bg-gray-300 hover:bg-gray-400" onClick={cancelFile}>취소</Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default TransferRecipientForm;