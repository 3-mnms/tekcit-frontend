import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/button/Button';
import { useMyPageUserQuery } from '@/models/my/useMyPage';
import { isUser, isHost } from '@/models/my/userTypes';
import styles from './DetailPage.module.css';
import {
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaIdCard,
  FaEnvelope,
  FaPen as FaEdit,
} from 'react-icons/fa';

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
      {/* Page header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>내 정보 수정</h1>
      </div>

      {/* 기본정보 카드 */}
      <div className={`${styles.card} ${styles.cardAccent}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FaUser className={styles.cardTitleIcon} aria-hidden />
            <span>기본정보</span>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.grid}>
            <div className={styles.row}>
              <div className={styles.rowLeft}>
                <FaIdCard className={styles.rowIcon} aria-hidden />
                <span className={styles.rowLabel}>이름</span>
              </div>
              <span className={styles.rowValue}>{base.name}</span>
            </div>

            {birthDisplay && (
              <div className={styles.row}>
                <div className={styles.rowLeft}>
                  <FaCalendarAlt className={styles.rowIcon} aria-hidden />
                  <span className={styles.rowLabel}>생년월일</span>
                </div>
                <span className={styles.rowValue}>{birthDisplay}</span>
              </div>
            )}

            {u?.gender && (
              <div className={styles.row}>
                <div className={styles.rowLeft}>
                  <FaUser className={styles.rowIcon} aria-hidden />
                  <span className={styles.rowLabel}>성별</span>
                </div>
                <span className={styles.rowValue}>
                  {u.gender === 'MALE' ? '남성' : u.gender === 'FEMALE' ? '여성' : '기타'}
                </span>
              </div>
            )}

            <div className={styles.row}>
              <div className={styles.rowLeft}>
                <FaPhone className={styles.rowIcon} aria-hidden />
                <span className={styles.rowLabel}>전화번호</span>
              </div>
              <span className={styles.rowValue}>{base.phone}</span>
            </div>

            {h?.businessName && (
              <div className={styles.row}>
                <div className={styles.rowLeft}>
                  <FaIdCard className={styles.rowIcon} aria-hidden />
                  <span className={styles.rowLabel}>사업체 명</span>
                </div>
                <span className={styles.rowValue}>{h.businessName}</span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => nav('/mypage/myinfo/detail/editinfo')}
            >
              <FaEdit className={styles.btnIcon} aria-hidden />
              정보 수정
            </Button>
          </div>
        </div>
      </div>

      {/* 계정정보 카드 */}
      <div className={`${styles.card} ${styles.cardAccent}`}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FaEnvelope className={styles.cardTitleIcon} aria-hidden />
            <span>계정정보</span>
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.grid}>
            <div className={styles.row}>
              <div className={styles.rowLeft}>
                <FaIdCard className={styles.rowIcon} aria-hidden />
                <span className={styles.rowLabel}>아이디</span>
              </div>
              <span className={styles.rowValue}>{base.loginId}</span>
            </div>

            <div className={styles.row}>
              <div className={styles.rowLeft}>
                <FaEnvelope className={styles.rowIcon} aria-hidden />
                <span className={styles.rowLabel}>이메일</span>
              </div>
              <span className={styles.rowValue}>{base.email}</span>
            </div>

            <div className={styles.row}>
              <div className={styles.rowLeft}>
                <FaIdCard className={styles.rowIcon} aria-hidden />
                <span className={styles.rowLabel}>가입 방법</span>
              </div>
              <span className={styles.rowValue}>{base.oauthProvider}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetailPage;
