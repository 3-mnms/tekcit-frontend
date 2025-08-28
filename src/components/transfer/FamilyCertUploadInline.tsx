import React, { useMemo, useRef, useState, useEffect } from 'react';
import Button from '@/components/common/button/Button';

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
    <div className="w-full">
      {/* 한 줄 폼 영역: 라벨 + 읽기전용 인풋 + 버튼 */}
      <div className="grid grid-cols-[90px_1fr_auto] items-center gap-2">
        <label className="text-sm text-gray-600">{label}</label>

        <input
          readOnly
          value={file ? file.name : ''}
          placeholder="ID 검색 또는 첨부를 통해서만 채워짐"
          className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed text-sm"
        />

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={onFileChange}
            className="hidden"
          />
          <Button className="px-4 py-2" onClick={pick}>
            첨부파일 선택
          </Button>
          {file && (
            <Button
              className="px-3 py-2 bg-gray-300 hover:bg-gray-400"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="relative bg-white rounded-2xl p-4 w-[90%] max-w-[420px] shadow-xl">
            {/* 헤더: 안내 텍스트(스케치의 '첨부파일 등록 • 로딩창' 위치) */}
            <div className="mb-3 text-sm text-gray-500">첨부파일 등록 • 로딩창</div>

            {/* 미리보기 박스 */}
            <div className="border rounded-xl overflow-hidden relative bg-gray-50">
              <div className="h-[360px] flex items-center justify-center">
                {isImage && (
                  <img
                    src={tempUrl}
                    alt="가족증명서 미리보기"
                    className="max-h-[340px] object-contain"
                    onLoad={() => setLoading(false)}
                  />
                )}

                {isPDF && (
                  <iframe
                    title="가족증명서 미리보기"
                    src={tempUrl}
                    className="w-full h-[360px] border-0"
                    onLoad={() => setLoading(false)}
                  />
                )}

                {!isImage && !isPDF && tempFile && (
                  <div className="text-center px-4">
                    <p className="text-sm text-gray-700">
                      미리보기를 지원하지 않는 형식이에요.
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{tempFile.name}</p>
                  </div>
                )}

                {/* 로딩창 오버레이 */}
                {loading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white rounded-xl px-6 py-3 shadow-lg text-sm font-medium">
                      로 딩 창
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 하단 버튼(확인/취소) */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button className="px-4 py-2" onClick={confirm}>
                확인
              </Button>
              <Button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400"
                onClick={cancel}
              >
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