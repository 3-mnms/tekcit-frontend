// src/components/transfer/TransferRecipientForm.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './TransferRecipientForm.module.css';
import Button from '@/components/common/button/Button';
import IdSearchModal, { type AccountMini } from './IdSearchModal';
import { useVerifyFamilyCert, useTransferor, useRequestTransfer } from '@/models/transfer/tanstack-query/useTransfer';
import { normalizeRrn7 } from '@/shared/api/transfer/userApi';
import type { PersonInfo } from '@/models/transfer/transferTypes';
import { useTekcitPayAccountQuery } from '@/models/transfer/tanstack-query/useTekcitPay';
import { isNoTekcitPayAccountError } from '@/shared/api/transfer/tekcitPay';
import { Users } from 'lucide-react'

type Relation = 'FAMILY' | 'FRIEND' | null;

// ✅ 라우팅 state 타입 (양도 페이지 진입 시 함께 넘어오는 값)
type TransferNavigateState = {
  reservationNumber?: string;
  othersTransferAvailable?: boolean; // 지인 양도 가능 여부
};

function toRrn7WithHyphen(input?: string): string {
  const raw = (input ?? '').toString().trim();
  const m = raw.match(/^(\d{6})-?(\d)$/);
  return m ? `${m[1]}-${m[2]}` : '';
}

/** 이름 정규화 */
function normName(s?: string) {
  return (s ?? '')
    .normalize('NFC')
    .replace(/\(.*?\)/g, '')
    .replace(/[\s·・\-\u00B7]/g, '')
    .replace(/[^\p{L}]/gu, '')
    .toLowerCase();
}

/** rrnFront 비교를 위한 6자리 숫자만 추출 */
function onlyFront6Digits(s?: string) {
  const d = (s ?? '').toString().replace(/\D/g, '');
  return d.slice(0, 6);
}

/** OCR 응답에서 '이름 + YYMMDD(앞6자리)' 일치 여부 */
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

type Props = {
  currentName?: string;
  currentRrn7?: string;
  /** ⬇️ 추가: 양도 요청에 필요한 예약번호 (필수) */
  reservationNumber: string;
  /** 선택 완료 후 다음 단계로 이동시키고 싶다면 주입 (선택) */
  onNext?: () => void;
};

const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 720;

const TransferRecipientForm: React.FC<Props> = (props) => {
  const navigate = useNavigate();

  // ✅ 라우팅 state에서 othersTransferAvailable 가져오기
  const location = useLocation();
  const navState = (location.state ?? null) as TransferNavigateState | null;
  const othersTransferAvailableFromNav = navState?.othersTransferAvailable;

  const propName = props.currentName?.trim();
  const propRrn7 = props.currentRrn7?.trim();

  const needFetchMe = !(propName && propRrn7);
  const { data: me, isLoading: meLoading, isError: meError, error: meErr } = useTransferor({ enabled: needFetchMe });

  const donorName = propName || me?.name || '';
  const donorRrn7 = toRrn7WithHyphen(propRrn7 || normalizeRrn7(me?.residentNum) || '');

  const [relation, setRelation] = useState<Relation>(null);

  // 상대(수신자)
  const [loginId, setLoginId] = useState<string>(''); // readOnly (이메일)
  const [name, setName] = useState<string>('');       // readOnly (이름)
  const [recipientRrn7, setRecipientRrn7] = useState<string>(''); // 하이픈 포함
  const [recipientId, setRecipientId] = useState<number | null>(null); // ⬅️ 추가: 양수자 ID

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
  const [hintMsg, setHintMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync: verifyFamily } = useVerifyFamilyCert();

  // 테킷페이 (제출 시에만 조회)
  const { refetch: refetchAccount } = useTekcitPayAccountQuery(false);

  // 양도요청 API 뮤테이션
  const { mutateAsync: requestTransfer, isPending: isRequesting } = useRequestTransfer();

  // 팝업/폴링
  const popupRef = useRef<Window | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const submittedRef = useRef(false); // 중복 요청 방지

  function cleanServerMessage(msg?: string): string {
    // 예) "404 ...", "[404] ...", "404: ...", "ERR_CODE: ...", "E-409 - ..."
    return (msg ?? '')
      .replace(/^\s*(?:\[\s*\d{3}\s*\]|\d{3}|[A-Z_]+(?:-\d+)?)(?:\s*[:\-]\s*)?\s*/, '')
      .trim();
  }

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
  const baseValid = safeLoginId.trim().length > 0 && safeName.trim().length > 0 && recipientId !== null;
  const canSubmit = baseValid && relation !== null && (!needProof || !!proofFile) && !isRequesting;

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

        const dict: Record<string, string> = {
          [donorName]: toRrn7WithHyphen(donorRrn7),
          [name]: toRrn7WithHyphen(recipientRrn7),
        };

        // 실제 호출
        const result = await verifyFamily({ file: tempFile!, targetInfo: dict });
        if (cancelled) return;

        const ok = !!result?.success;
        setVerifyOk(ok);
        setVerifyDone(true);
        setProgress(100);

        setHintMsg(ok ? null : cleanServerMessage(result?.message ?? '인증에 실패했어요.'));
      } catch (err: unknown) {
        if (!cancelled) {
          const anyE = err as { response?: { data?: { message?: string } }, message?: string };
          const raw = anyE?.response?.data?.message || anyE?.message || 'OCR 인증 실패';
          setErrorMsg(cleanServerMessage(raw));
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
  }, [modalOpen, previewLoading, relation, tempFile, donorName, donorRrn7, name, recipientRrn7, verifyFamily]);

  function pickErr(e: unknown) {
    const anyE = e as { response?: { status?: number; data?: { errorCode?: string; code?: string; message?: string } }, status?: number, message?: string };
    const status = anyE?.response?.status ?? anyE?.status;
    const code = anyE?.response?.data?.errorCode || anyE?.response?.data?.code;
    const message = anyE?.response?.data?.message || anyE?.message || '';
    return { status, code, message };
  }

  /** ⬇️ 양도요청 실제 호출 (중복방지) */
  const submitRequest = async () => {
    if (submittedRef.current) return;
    if (!props.reservationNumber) {
      alert('reservationNumber가 없습니다. 상위 컴포넌트에서 전달해 주세요.');
      return;
    }
    if (recipientId == null || !relation) {
      alert('수신자 정보 또는 관계가 누락되었습니다.');
      return;
    }

    const transferType = relation === 'FAMILY' ? 'FAMILY' : 'OTHERS';

    const payload = {
      reservationNumber: props.reservationNumber,
      recipientId,
      transferType,
      senderName: donorName || '',
    };

    console.groupCollapsed(
      '%c[TransferRecipientForm] Request → /api/transfer/request',
      'color:#2563eb;font-weight:700'
    );
    console.groupEnd();

    try {
      await requestTransfer(payload);
      submittedRef.current = true;

      // ✅ 성공 알림
      alert('양도요청 되었습니다.');

      console.info(
        '%c[TransferRecipientForm] ✅ requestTransfer success',
        'color:#16a34a;font-weight:700',
        { reservationNumber: props.reservationNumber, recipientId, transferType }
      );
    } catch (e: unknown) {
      const { status, code, message } = pickErr(e);

      const msgHasTransferOnce =
        typeof message === 'string' &&
        (message.includes('양도 1회') ||
          message.includes('이미 양도') ||
          message.includes('진행되고 있는 양도'));

      // ✅ 진짜 "이미 양도됨" 케이스만 여기서 처리
      if (code === 'ALREADY_TRANSFERRED' || code === 'TRANSFER_ALREADY_COMPLETED' || msgHasTransferOnce) {
        alert('이미 양도처리된 티켓입니다.');
        console.warn('[TransferRecipientForm] already transferred');
        return;
      }

      // ✅ 나머지는 서버 메시지(상태코드 접두어 제거)만 던짐
      throw new Error(cleanServerMessage(message) || '처리 중 오류가 발생했어요.');
    }
  };

  // ===== 팝업 메시지 수신(완료 시) + 정리 =====
  useEffect(() => {
    const onMessage = async (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      if (!ev.data || typeof ev.data !== 'object') return;

      if ((ev.data as { type?: string }).type === 'TEKCIT_PAY_ACCOUNT_CREATED') {
        try {
          const res = await refetchAccount();
          if (res?.data) {
            if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
            if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
            // 🔔 계정 생성 확인되면 곧장 양도요청 → 다음 단계
            await submitRequest();
            props.onNext?.();
          }
        } catch {
          // 무시
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [refetchAccount, props]); // submitRequest는 안정적 참조(closure 내 사용 변수만)

  // 팝업 열기 + 폴링
  const openTekcitPayJoinPopup = () => {
    const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
    const dualScreenTop = window.screenTop ?? window.screenY ?? 0;
    const width = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
    const height = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;

    const left = dualScreenLeft + Math.max(0, (width - POPUP_WIDTH) / 2);
    const top = dualScreenTop + Math.max(0, (height - POPUP_HEIGHT) / 2);

    const url = `/payment/wallet/join?popup=1`;
    const features = `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},resizable=yes,scrollbars=yes`;

    popupRef.current = window.open(url, 'tekcitpay_join', features);

    // 폴링: 2초 간격으로 계정 생성 여부 확인
    if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
    pollTimerRef.current = window.setInterval(async () => {
      const popup = popupRef.current;
      if (!popup || popup.closed) {
        window.clearInterval(pollTimerRef.current!);
        pollTimerRef.current = null;
        return;
      }
      try {
        const res = await refetchAccount();
        if (res?.data) {
          popup.close();
          window.clearInterval(pollTimerRef.current!);
          pollTimerRef.current = null;
          await submitRequest();
          props.onNext?.();
        }
      } catch {
        // keep polling
      }
    }, 2000);
  };

  // 양도자 정보 로딩/에러 처리
  if (needFetchMe) {
    if (meLoading) return <div className={styles.card}>내 정보(양도자) 불러오는 중…</div>;
    if (meError)
      return (
        <div className={styles.card} style={{ color: '#b91c1c' }}>
          내 정보 조회 실패: {(meErr as { message?: string })?.message ?? '알 수 없는 오류'}
        </div>
      );
  }

  // 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // ✅ 지인(FRIEND) 선택 시, 15분 경과로 지인 양도 불가한 상태면 바로 차단
    if (relation === 'FRIEND' && othersTransferAvailableFromNav === false) {
      alert('15분이 지나 지인에게 양도가 불가합니다.');
      return;
    }

    try {
      if (relation === 'FAMILY') {
        // OCR까지 통과했다고 가정(파일 선택/확인 플로우)
        await submitRequest();
        props.onNext?.();
        return;
      }

      // FRIEND: 테킷페이 계정 확인 → 없으면 팝업 가입 후 자동 진행
      const res = await refetchAccount();
      if (res?.data) {
        await submitRequest();
        props.onNext?.();
        return;
      }
      if (isNoTekcitPayAccountError(res.error as unknown)) {
        openTekcitPayJoinPopup();
        return;
      }
      throw (res.error || new Error('계정 조회 실패'));
    } catch (err) {
      const { message } = pickErr(err);
      const fallback = (err as Error)?.message || '양도 요청 중 오류가 발생했어요.';
      alert(cleanServerMessage(fallback));
    }
  };

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <h2 className={styles.title}><Users className={styles.iconTitle} aria-hidden />
        양도/환불 안내</h2>

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
        {isRequesting ? '전송 중…' : '다음'}
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

            {/* 상태 텍스트 */}
            <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }} aria-live="polite">
              {verifyDone
                ? (verifyOk ? '두 인원 매칭 완료' : (hintMsg ?? '일치하는 인원을 찾지 못했어요'))
                : (extracting ? '인증 중…' : '로딩 중…')}
            </div>

            {/* 통신/서버 에러만 붉은 경고 */}
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
          // 이메일/이름 세팅
          setLoginId((acc as any)?.id ?? '');
          setName((acc as any)?.name ?? '');

          // 숫자형 userId 추출
          const rawUserId =
            (acc as any)?.userId ??
            (acc as any)?.uid ??
            (acc as any)?.idNumeric ??
            null;
          setRecipientId(typeof rawUserId === 'number' ? rawUserId : Number.isFinite(Number(rawUserId)) ? Number(rawUserId) : null);

          // 주민번호 앞자리
          const rrn7Raw = (acc as any)?.rrn7 ?? (acc as any)?.residentNum ?? '';
          setRecipientRrn7(toRrn7WithHyphen(rrn7Raw));
        }}
      />
    </form>
  );
};

export default TransferRecipientForm;
