// src/components/reservation/TicketBookerInfoSection.tsx
import React from 'react';

type Props = {
  name?: string;
  phone?: string;   // '010-1234-5678' 또는 숫자만
  email?: string;   // 'user@example.com'
  className?: string;
  readOnly?: boolean; // 기본 true
};

const DUMMY = {
  name: '김예매',
  phone: '010-1234-5678',
  email: 'ticket.user@example.com',
};

function splitPhone(p: string): [string, string, string] {
  const digits = (p ?? '').replace(/\D/g, '');
  // 010-XXXX-XXXX 기준으로 나눔
  const a = digits.slice(0, 3) || '010';
  const b = digits.slice(3, digits.length === 10 ? 6 : 7) || '1234';
  const c = digits.slice(digits.length === 10 ? 6 : 7) || '5678';
  return [a, b, c];
}

function splitEmail(e: string): [string, string] {
  const [id = 'ticket.user', domain = 'example.com'] = (e ?? '').split('@');
  return [id, domain];
}

const TicketBookerInfoSection: React.FC<Props> = ({
  name = DUMMY.name,
  phone = DUMMY.phone,
  email = DUMMY.email,
  className = '',
  readOnly = true,
}) => {
  const [p1, p2, p3] = splitPhone(phone);
  const [eid, edom] = splitEmail(email);

  const inputCls =
    'w-full rounded border px-3 py-2 text-sm bg-gray-50 ' +
    (readOnly ? 'cursor-default' : '');

  return (
    <section className={`w-full rounded-2xl border p-5 ${className}`}>
      <h2 className="mb-3 text-lg font-semibold">예매자 확인</h2>

      {/* 예매자 이름 */}
      <div className="mb-4">
        <div className="mb-1 text-sm font-medium">예매자</div>
        <input className={inputCls} value={name} readOnly={readOnly} aria-label="예매자" />
      </div>

      {/* 전화번호 */}
      <div className="mb-4">
        <div className="mb-1 text-sm font-medium">전화번호</div>
        <div className="flex gap-2">
          <input className={`${inputCls}`} value={p1} readOnly={readOnly} aria-label="전화번호 앞자리" />
          <input className={`${inputCls}`} value={p2} readOnly={readOnly} aria-label="전화번호 중간자리" />
          <input className={`${inputCls}`} value={p3} readOnly={readOnly} aria-label="전화번호 끝자리" />
        </div>
      </div>

      {/* 이메일 */}
      <div>
        <div className="mb-1 text-sm font-medium">이메일</div>
        <div className="flex items-center gap-2">
          <input className={inputCls} value={eid} readOnly={readOnly} aria-label="이메일 아이디" />
          <span className="px-1 text-sm">@</span>
          <input className={inputCls} value={edom} readOnly={readOnly} aria-label="이메일 도메인" />
        </div>
      </div>
    </section>
  );
};

export default TicketBookerInfoSection;
