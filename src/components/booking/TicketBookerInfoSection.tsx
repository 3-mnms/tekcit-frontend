import React from 'react';
import styles from './TicketBookerInfoSection.module.css';

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

  const inputClass = `${styles.input} ${readOnly ? styles.readOnly : ''}`;

  return (
    <section className={`${styles.container} ${className}`}>
      <h2 className={styles.title}>예매자 확인</h2>

      {/* 예매자 이름 */}
      <div className={styles.block}>
        <div className={styles.label}>예매자</div>
        <input
          className={inputClass}
          value={name}
          readOnly={readOnly}
          aria-label="예매자"
        />
      </div>

      {/* 전화번호 */}
      <div className={styles.block}>
        <div className={styles.label}>전화번호</div>
        <div className={styles.row}>
          <input
            className={inputClass}
            value={p1}
            readOnly={readOnly}
            aria-label="전화번호 앞자리"
          />
          <input
            className={inputClass}
            value={p2}
            readOnly={readOnly}
            aria-label="전화번호 중간자리"
          />
          <input
            className={inputClass}
            value={p3}
            readOnly={readOnly}
            aria-label="전화번호 끝자리"
          />
        </div>
      </div>

      {/* 이메일 */}
      <div>
        <div className={styles.label}>이메일</div>
        <div className={styles.emailRow}>
          <input
            className={inputClass}
            value={eid}
            readOnly={readOnly}
            aria-label="이메일 아이디"
          />
          <span className={styles.at}>@</span>
          <input
            className={inputClass}
            value={edom}
            readOnly={readOnly}
            aria-label="이메일 도메인"
          />
        </div>
      </div>
    </section>
  );
};

export default TicketBookerInfoSection;
