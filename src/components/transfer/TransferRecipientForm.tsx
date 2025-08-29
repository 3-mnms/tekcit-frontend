// src/components/transfer/TransferRecipientForm.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import styles from './TransferRecipientForm.module.css';
import Button from '@/components/common/button/Button';
import IdSearchModal, { type AccountMini } from './IdSearchModal';
import { useExtractPersonInfo, useTransferor } from '@/models/transfer/tanstack-query/useTransfer';
import { normalizeRrn7 } from '@/shared/api/transfer/userApi';
import type { PersonInfo } from '@/models/transfer/transferTypes';
import { api } from '@/shared/config/axios';

type Relation = 'FAMILY' | 'FRIEND' | null;

/** 'YYMMDD-#' 또는 'YYMMDD#' → {front6, back1} (안전 가드) */
function parseRrn7(input?: string): { front6?: string; back1?: string } {
  const raw = (input ?? '').toString().trim();
  const m = raw.match(/^(\d{6})-?(\d)$/);
  if (!m) return {};
  return { front6: m[1], back1: m[2] };
}

/** 'YYMMDD-#'로 강제 표준화 */
function toRrn7WithHyphen(input?: string): string {
  const raw = (input ?? '').toString().trim();
  const m = raw.match(/^(\d{6})-?(\d)$/);
  return m ? `${m[1]}-${m[2]}` : '';
}

/** 이름 정규화: NFC + 공백/중점/하이픈/괄호·내용/문장부호 제거 + 소문자 */
function normName(s?: string) {
  return (s ?? '')
    .normalize('NFC')
    .replace(/\(.*?\)/g, '')                 // 괄호 속 설명 제거 (예: (본인))
    .replace(/[\s·・\-\u00B7]/g, '')        // 공백/중점류 제거
    .replace(/[^\p{L}]/gu, '')               // 문자(Letters) 외 제거
    .toLowerCase();
}

/** rrnFront 비교를 위한 6자리 숫자만 추출 */
function onlyFront6Digits(s?: string) {
  const d = (s ?? '').toString().replace(/\D/g, '');
  return d.slice(0, 6);
}

/** OCR 응답에서 '이름 + YYMMDD(앞6자리)' 일치 여부 — 이름/숫자 모두 정규화 후 비교 */
function hasMatch(people: PersonInfo[], name: string, rrn7: { front6?: string; back1?: string }) {
  const nm = normName(name);
  const front6 = rrn7.front6 ?? '';
  if (!nm || !front6) return false;

  return people.some((p) => {
    const pn = normName(p.name);
    const rr = onlyFront6Digits(p.rrnFront);
    return pn === nm && rr === front6;
  });
}

/** 콘솔 프리뷰(사람 정보) */
function logPreview(tag: string, donorName: string, donorRrn7: string, recipName: string, recipRrn7: string) {
  const me = parseRrn7(donorRrn7);
  const other = parseRrn7(recipRrn7);
  console.group(tag);
  console.table({
    '양도자(나)': { name: donorName ?? '', rrn7: donorRrn7 ?? '', front6: me.front6 ?? '', back1: me.back1 ?? '' },
    '양수자(상대)': { name: recipName ?? '', rrn7: recipRrn7 ?? '', front6: other.front6 ?? '', back1: other.back1 ?? '' },
  });
  console.groupEnd();
}

/** HTTP 미리보기 유틸 */
function logFormData(fd: FormData) {
  console.group('[HTTP PREVIEW] FormData');
  for (const [k, v] of (fd.entries() as any)) {
    if (v instanceof File) {
      console.log(k, `(File) name=${v.name}, type=${v.type || 'n/a'}, size=${v.size}B`);
    } else if (v instanceof Blob) {
      console.log(k, `(Blob) type=${(v as Blob).type || 'n/a'}`);
    } else {
      console.log(k, String(v));
    }
  }
  console.groupEnd();
}
function buildCurl(url: string, fd: FormData, headers: Record<string, string> = {}) {
  const parts: string[] = [`curl -i -X POST '${url}'`];
  for (const [hk, hv] of Object.entries(headers)) {
    if (/^content-type$/i.test(hk)) continue; // boundary는 curl이 자동
    parts.push(`-H '${hk}: ${hv}'`);
  }
  for (const [k, v] of (fd.entries() as any)) {
    if (v instanceof File) {
      parts.push(`-F '${k}=@${v.name};type=${v.type || 'application/octet-stream'}'`);
    } else {
      const val = String(v).replace(/'/g, `'\\''`);
      parts.push(`-F '${k}=${val}'`);
    }
  }
  return parts.join(' \\\n  ');
}

type Props = {
  currentName?: string;
  currentRrn7?: string;
};

const TransferRecipientForm: React.FC<Props> = (props) => {
  const propName = props.currentName?.trim();
  const propRrn7 = props.currentRrn7?.trim();

  const needFetchMe = !(propName && propRrn7);
  const { data: me, isLoading: meLoading, isError: meError, error: meErr } = useTransferor({ enabled: needFetchMe });

  const donorName = propName || me?.name || '';
  const donorRrn7 = toRrn7WithHyphen(propRrn7 || normalizeRrn7(me?.residentNum) || '');

  const [relation, setRelation] = useState<Relation>(null);

  // 상대(수신자)
  const [loginId, setLoginId] = useState<string>(''); // readOnly
  const [name, setName] = useState<string>('');       // readOnly
  const [recipientRrn7, setRecipientRrn7] = useState<string>(''); // 하이픈 포함

  // 이메일 검색 모달
  const [searchOpen, setSearchOpen] = useState(false);

  // 파일/미리보기
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tempUrl = useMemo(() => (tempFile ? URL.createObjectURL(tempFile) : ''), [tempFile]);

  // OCR 상태
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0); // 0~100
  const [verifyDone, setVerifyDone] = useState(false);
  const [verifyOk, setVerifyOk] = useState(false);

  // 메시지
  const [hintMsg, setHintMsg] = useState<string | null>(null);      // 논리적 실패(부분일치 등) 안내
  const [errorMsg, setErrorMsg] = useState<string | null>(null);    // 네트워크/서버 에러만

  const { mutateAsync: extract } = useExtractPersonInfo();

  useEffect(() => () => { if (tempUrl) URL.revokeObjectURL(tempUrl); }, [tempUrl]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (modalOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = prev || '';
    return () => { document.body.style.overflow = prev || ''; };
  }, [modalOpen]);

  const isPdf = !!tempFile && tempFile.type === 'application/pdf';
  const needProof = relation === 'FAMILY';

  const safeLoginId = loginId ?? '';
  const safeName = name ?? '';
  const baseValid = safeLoginId.trim().length > 0 && safeName.trim().length > 0;
  const canSubmit = baseValid && relation !== null && (!needProof || !!proofFile);

  const handleFileChange = (f?: File) => {
    if (!f) return;
    setTempFile(f);
    setModalOpen(true);
    setPreviewLoading(true);

    // 상태 초기화
    setExtracting(false);
    setProgress(0);
    setVerifyDone(false);
    setVerifyOk(false);
    setHintMsg(null);
    setErrorMsg(null);
  };

  const confirmFile = () => {
    if (!verifyOk) return;
    setProofFile(tempFile);
    setModalOpen(false);
  };
  const cancelFile = () => {
    setTempFile(null);
    setModalOpen(false);
    setExtracting(false);
    setProgress(0);
    setVerifyDone(false);
    setVerifyOk(false);
    setHintMsg(null);
    setErrorMsg(null);
  };

  // ===== 미리보기 완료되면 자동 OCR (가족 관계일 때만) =====
  useEffect(() => {
    const shouldRun =
      modalOpen &&
      !previewLoading &&
      relation === 'FAMILY' &&
      !!tempFile &&
      !!donorName &&
      !!donorRrn7 &&
      !!name &&
      !!recipientRrn7;

    if (!shouldRun) return;

    let intervalId: any;
    let cancelled = false;

    const run = async () => {
      try {
        setExtracting(true);
        setHintMsg(null);
        setErrorMsg(null);
        setVerifyDone(false);
        setVerifyOk(false);

        // 가짜 진행률: 94%까지 천천히
        setProgress(8);
        intervalId = setInterval(() => {
          setProgress((prev) => (prev < 94 ? prev + 2 : prev));
        }, 120);

        const meR = parseRrn7(donorRrn7);
        const otherR = parseRrn7(recipientRrn7);

        // 호출 직전 프리뷰
        logPreview('🟨 [OCR 호출 직전] 가족관계 확인 파라미터 미리보기', donorName, donorRrn7, name, recipientRrn7);

        // 서버 요구 딕셔너리
        const dict: Record<string, string> = {
          [donorName]: toRrn7WithHyphen(donorRrn7),
          [name]: toRrn7WithHyphen(recipientRrn7),
        };
        console.log('[REQ targetInfo]', JSON.stringify(dict));

        // HTTP 미리보기
        const fd = new FormData();
        fd.append('file', tempFile!);
        fd.append('targetInfo', JSON.stringify(dict));

        const base = api.defaults.baseURL?.replace(/\/+$/, '') ?? '';
        const endpoint = '/transfer/extract';
        const fullUrl = `${base}${endpoint}`;

        const defaults: any = (api.defaults.headers as any) || {};
        const common: Record<string, any> = defaults.common ?? {};
        const headersPreview: Record<string, string> = {};
        Object.keys(common).forEach((k) => {
          const v = String(common[k]);
          headersPreview[k] = /^authorization$/i.test(k) ? 'Bearer *****' : v;
        });

        console.groupCollapsed('[HTTP PREVIEW] POST /transfer/extract');
        console.log('URL:', fullUrl);
        console.log('Method:', 'POST (multipart/form-data; boundary=*)');
        console.log('Headers (approx):', headersPreview);
        logFormData(fd);
        console.log('cURL:\n' + buildCurl(fullUrl, fd, headersPreview));
        console.groupEnd();

        // === 실제 호출 ===
        const people = await extract({ file: tempFile!, targetInfo: dict });

        // 응답 확인
        console.groupCollapsed('🟩 [OCR 응답 people]');
        console.table(people);
        console.groupEnd();

        // 개별 매칭 사유 로깅
        const explain = (label: string, expectName: string, expectFront6?: string) => {
          const n = normName(expectName);
          const rows = people.map(p => ({
            name: p.name,
            rrnFront: p.rrnFront,
            normalizedNameEq: normName(p.name) === n,
            front6Eq: onlyFront6Digits(p.rrnFront) === (expectFront6 ?? ''),
          }));
          console.groupCollapsed(`🔎 match check: ${label}`);
          console.table(rows);
          console.groupEnd();
        };
        if (!cancelled) {
          explain('양도자', donorName, meR.front6);
          explain('양수자', name, otherR.front6);
        }

        if (cancelled) return;

        const okMe = hasMatch(people, donorName, meR);
        const okOther = hasMatch(people, name, otherR);
        const ok = okMe && okOther;

        setVerifyOk(ok);
        setVerifyDone(true);
        setProgress(100);

        // ❗️논리적 불일치(부분일치 포함): 빨간 경고로 중복 출력하지 말고 hint만
        if (!ok) {
          const msg = okMe && !okOther
            ? '양도자는 확인되었지만, 양수자가 문서에서 확인되지 않았어요.'
            : (!okMe && okOther
                ? '양수자는 확인되었지만, 양도자가 문서에서 확인되지 않았어요.'
                : '일치하는 인원을 찾지 못했어요');
          setHintMsg(msg);
        } else {
          setHintMsg(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          // ⛔️ 통신/서버 에러만 errorMsg로 (붉은 경고)
          setErrorMsg(err?.message || 'OCR 인증 실패');
          setVerifyOk(false);
          setVerifyDone(true);
          setProgress(100);
        }
      } finally {
        if (!cancelled) setExtracting(false);
        if (intervalId) clearInterval(intervalId);
      }
    };

    run();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [modalOpen, previewLoading, relation, tempFile, donorName, donorRrn7, name, recipientRrn7, extract]);

  // 양도자 정보 로딩/에러 처리
  if (needFetchMe) {
    if (meLoading) return <div className={styles.card}>내 정보(양도자) 불러오는 중…</div>;
    if (meError)
      return (
        <div className={styles.card} style={{ color: '#b91c1c' }}>
          내 정보 조회 실패: {(meErr as any)?.message ?? '알 수 없는 오류'}
        </div>
      );
  }

  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        alert(relation === 'FAMILY' ? '가족 OCR 인증 통과 → 다음 단계!' : '결제 단계로 이동!');
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

      {/* 전송할 EMAIL */}
      <label className={styles.label}>
        전송할 EMAIL
        <div className={styles.idRow}>
          <input
            className={`${styles.inputShort} ${styles.inputAttached}`}
            value={safeLoginId}
            placeholder="이메일 검색으로만 입력됩니다"
            readOnly
            aria-readonly="true"
            onKeyDown={(e) => e.preventDefault()}
          />
          <Button type="button" className={styles.searchBtn} onClick={() => setSearchOpen(true)}>
            이메일 검색
          </Button>
        </div>
      </label>

      {/* 이름(읽기전용) */}
      <label className={styles.label}>
        이름
        <input
          className={styles.input}
          value={safeName}
          readOnly
          aria-readonly="true"
          placeholder="이메일 검색으로 자동 채워집니다"
          onKeyDown={(e) => e.preventDefault()}
        />
      </label>

      {/* 가족 증빙 업로드 */}
      {relation === 'FAMILY' && (
        <>
          <div className={styles.proofWrap}>
            <span className={styles.proofLabel}>가족증명서</span>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className={styles.fileInput}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.currentTarget.value = '';
                if (f) {
                  if (f.size > 10 * 1024 * 1024) {
                    alert('파일은 10MB 이하만 가능합니다.');
                    return;
                  }
                  if (!/^application\/pdf$/.test(f.type)) {
                    alert('PDF만 업로드할 수 있습니다.');
                    return;
                  }
                }
                handleFileChange(f);
              }}
            />

            <div className={styles.dropzone}>
              <button type="button" className={styles.fileButton} onClick={() => fileInputRef.current?.click()}>
                파일 선택
              </button>
              <span className={styles.fileHelp}>PDF 가능 · 10MB 이하</span>
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
        className={`${styles.submitBtn} ${canSubmit ? '' : styles.submitBtnDisabled}`}
        disabled={!canSubmit}
      >
        다음
      </Button>

      {/* ===== 파일 미리보기 + OCR 검사 모달 ===== */}
      {modalOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="ocr-modal-title">
          <div className={styles.modalCard}>
            <div id="ocr-modal-title" className={styles.modalTitle}>
              첨부파일 등록 · 인증 진행
            </div>

            <div className={styles.previewBox}>
              <div className={styles.previewArea}>
                {isPdf ? (
                  <iframe
                    title="가족증명서 미리보기"
                    src={tempUrl}
                    className={styles.previewPdf}
                    onLoad={() => setPreviewLoading(false)}
                  />
                ) : tempFile ? (
                  <div className={styles.previewFallback}>
                    <p>미리보기를 지원하지 않는 형식이에요.</p>
                    <p className={styles.previewFilename}>{tempFile.name}</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* 하단 슬림 진행률 바 */}
            <div
              style={{
                marginTop: 8,
                position: 'relative',
                height: 4,
                background: '#e5e7eb',
                borderRadius: 2,
                overflow: 'hidden',
              }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label={extracting ? '인증 진행률' : '로딩 진행률'}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: extracting ? '#3b82f6' : '#9ca3af',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>

            {/* 상태 텍스트 — 한 줄만 (중복 제거) */}
            <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }} aria-live="polite">
              {verifyDone
                ? (verifyOk ? '두 인원 매칭 완료' : (hintMsg ?? '일치하는 인원을 찾지 못했어요'))
                : (extracting ? '인증 중…' : '로딩 중…')}
            </div>

            {/* 통신/서버 에러만 붉은 경고로 별도 표기 */}
            {!!errorMsg && (
              <div className={styles.progressText} style={{ color: '#b91c1c', marginTop: 6 }} role="alert">
                {errorMsg}
              </div>
            )}

            <div className={styles.modalBtns}>
              <Button
                className={`${styles.modalBtn} ${!verifyOk ? styles.modalBtnDisabled : ''}`}
                onClick={confirmFile}
                disabled={!verifyOk}
              >
                확인
              </Button>
              <Button className={styles.modalBtnGray} onClick={cancelFile} disabled={extracting}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== 이메일 검색 모달 ===== */}
      <IdSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(acc: AccountMini) => {
          setLoginId(acc?.id ?? '');
          setName(acc?.name ?? '');

          const rrn7Raw = (acc as any)?.rrn7 ?? (acc as any)?.residentNum ?? '';
          setRecipientRrn7(toRrn7WithHyphen(rrn7Raw));

          logPreview('🟦 [선택 직후] 양도/양수 정보 미리보기', donorName, donorRrn7, acc?.name ?? '', toRrn7WithHyphen(rrn7Raw));
        }}
      />
    </form>
  );
};

export default TransferRecipientForm;
