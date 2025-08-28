import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import DetailInfoField from '@/components/my/myinfo/DetailInfoField';
import { useMyPageUserQuery } from '@/models/my/useMyPage';
import { isUser, isHost } from '@/models/my/userTypes';
import styles from './DetailPage.module.css';

function toDotDate(input?: string): string | undefined {
  if (!input) return undefined;
  const digits = input.replace(/\D/g, '');
  if (digits.length === 8) {
    const yyyy = digits.slice(0, 4);
    const mm = digits.slice(4, 6);
    const dd = digits.slice(6, 8);
    return `${yyyy}.${mm}.${dd}`;
  }
  if (digits.length === 6) return undefined;

  const normalized = input.replace(/[-/]/g, '.');
  return normalized.length >= 10 ? normalized.slice(0, 10) : normalized;
}

function birthFromResidentNum(rrn?: string): string | undefined {
  if (!rrn) return undefined;
  const m = rrn.replace(/\D/g, '').match(/^(\d{6})(\d)/);
  if (!m) return undefined;
  const yy = m[1].slice(0, 2);
  const mm = m[1].slice(2, 4);
  const dd = m[1].slice(4, 6);
  const s = m[2];

  let century: number | undefined;
  if (s === '1' || s === '2') century = 1900;
  else if (s === '3' || s === '4') century = 2000;
  else return undefined; 

  const yyyy = century + parseInt(yy, 10);
  return `${yyyy}.${mm}.${dd}`;
}

function resolveBirth(u?: { birth?: string; residentNum?: string }): string | undefined {
  return birthFromResidentNum(u?.residentNum) ?? toDotDate(u?.birth);
}


const DetailPage: React.FC = () => {
  const nav = useNavigate();
  const { data, isLoading, isError } = useMyPageUserQuery();

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>불러오는 중…</div>
      </section>
    );
  }
  if (isError || !data) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>불러오기에 실패했어요.</div>
      </section>
    );
  }

  const base = data;
  const u = isUser(data) ? data : undefined;
  const h = isHost(data) ? data : undefined;

  const birthDisplay = resolveBirth(u);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>기본정보</h2>
      <div className={styles.card}>
        <DetailInfoField label="이름" value={base.name} />
        {birthDisplay && <DetailInfoField label="생년월일" value={birthDisplay} />}
        {u?.gender && (
          <DetailInfoField
            label="성별"
            value={u.gender === 'MALE' ? '남성' : u.gender === 'FEMALE' ? '여성' : '기타'}
          />
        )}
        <DetailInfoField label="전화번호" value={base.phone} />
        {h?.businessName && <DetailInfoField label="사업체 명" value={h.businessName} />}

        <div className={styles.buttonWrapper}>
          <Button className={styles.button} onClick={() => nav('/mypage/myinfo/detail/editinfo')}>
            정보 수정
          </Button>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title2}>계정정보</h2>
        <DetailInfoField label="아이디" value={base.loginId} />
        <DetailInfoField label="이메일" value={base.email} />
        <DetailInfoField label="가입 방법" value={base.oauthProvider} />
      </div>
    </section>
  );
};

export default DetailPage;
