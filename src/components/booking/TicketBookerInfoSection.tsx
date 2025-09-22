import React from 'react';
import styles from './TicketBookerInfoSection.module.css';
import { usePreReservation } from '@/models/booking/tanstack-query/useUser'; 
import Spinner from '@/components/common/spinner/Spinner'

type Props = {
  className?: string;
  readOnly?: boolean; // 기본 true
};

function splitPhone(p: string): [string, string, string] {
  const digits = (p ?? '').replace(/\D/g, '');
  const a = digits.slice(0, 3) || '';
  const b = digits.slice(3, digits.length === 10 ? 6 : 7) || '';
  const c = digits.slice(digits.length === 10 ? 6 : 7) || '';
  return [a, b, c];
}

function splitEmail(e: string): [string, string] {
  const [id = '', domain = ''] = (e ?? '').split('@');
  return [id, domain];
}

const TicketBookerInfoSection: React.FC<Props> = ({
  className = '',
  readOnly = true,
}) => {
  const { data, isLoading, isError } = usePreReservation(true); // API 호출
  const name = data?.name ?? '';
  const phone = data?.phone ?? '';
  const email = data?.email ?? '';

  const [p1, p2, p3] = splitPhone(phone);
  const [eid, edom] = splitEmail(email);

  const inputClass = `${styles.input} ${readOnly ? styles.readOnly : ''}`;

  if (isLoading) {
    return <Spinner />;
  }
  if (isError || !data) {
    return <div className={styles.container}>예매자 정보를 불러오지 못했어요.</div>;
  }

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
