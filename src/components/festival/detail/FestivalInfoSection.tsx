import React, { useMemo } from 'react';
import styles from './FestivalInfoSection.module.css';
import type { FestivalDetail } from '@/models/festival/festivalType';
import { useIsFavorite, useFavoriteCount, useCreateFavoriteMutation, useDeleteFavoriteMutation } from '@/models/festival/tanstack-query/useFavoritesDetail';
import { useAuthStore } from '@/shared/storage/useAuthStore';

type Props = {
  detail?: FestivalDetail;
  loading?: boolean;
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
};
const formatPrice = (n?: number) =>
  typeof n === 'number' ? n.toLocaleString() + '원' : '';

const FestivalInfoSection: React.FC<Props> = ({ detail, loading }) => {
  // ✅ fid 안전 추출 (프로젝트 DTO에 맞게 필요하면 수정!)
  const fid = useMemo(() => {
    const raw = (detail as any)?.fid ?? (detail as any)?.mt20id ?? (detail as any)?.id;
    return raw ? String(raw) : undefined;
  }, [detail]);

  // ✅ 로그인 토큰
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const isUserRole = role === 'USER';
  const [imgReady, setImgReady] = React.useState(false);

  // ✅ 찜 상태/카운트 + 토글 뮤테이션
  const { data: likedData } = useIsFavorite(fid, Boolean(accessToken && isUserRole)); // 내 찜 여부(로그인 필요)
  const { data: countData } = useFavoriteCount(fid); // 공개
  const createMut = useCreateFavoriteMutation(fid || '');
  const deleteMut = useDeleteFavoriteMutation(fid || '');

  const liked = likedData?.liked ?? false;
  const count = countData?.count ?? 0;
  const toggling = createMut.isPending || deleteMut.isPending;

  const onToggleLike = () => {
    if (!fid) return;
    if (!accessToken) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (!isUserRole) {
      alert('관리자 또는 주최자 계정에서는 관심 등록을 사용할 수 없습니다.\n일반 사용자 계정으로 이용해 주세요.');
      return;
    }
    if (liked) deleteMut.mutate();
    else createMut.mutate();
  };

  if (loading && !detail) {
    return (
      <section className={styles.container}>
        <div className={styles.left}>
          <div className={styles.posterPlaceholder}>Loading…</div>
          <button className={styles.likeBtn} type="button" disabled>
            <i className="fa-heart fa-regular" /> 0
          </button>
        </div>
        <div className={styles.right}>
          <h1 className={styles.title}>로딩 중…</h1>
        </div>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className={styles.container}>
        <div className={styles.right}>
          <h1 className={styles.title}>공연 정보를 불러오지 못했어요</h1>
        </div>
      </section>
    );
  }

  const performers =
    detail.fcast ? detail.fcast.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <section className={styles.container}>
      {/* 왼쪽: 포스터 + 찜 */}
      <div className={styles.left}>
        {detail.poster ? (
          <>
            <img
              src={detail.poster}
              alt={`${detail.prfnm} 포스터`}
              className={`${styles.poster} ${imgReady ? styles.posterShow : styles.posterHide}`}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              onLoad={() => setImgReady(true)}
            />
            {!imgReady && (
              <div
                className={styles.posterPlaceholder}
              />
            )}
          </>
        ) : (
          <div className={styles.posterPlaceholder}>No Image</div>
        )}
        <button
          className={`${styles.likeBtn} ${liked ? styles.likeBtnLiked : ''}`}
          type="button"
          aria-pressed={liked}
          aria-label={liked ? '관심 해제' : '관심 추가'}
          onClick={onToggleLike}
          disabled={toggling || !fid}
        >
          {/* Font Awesome: 채움/비채움 */}
          <i className={`fa-heart ${liked ? 'fa-solid' : 'fa-regular'}`} />
          <span className={styles.likeCount}>{count}</span>
        </button>
      </div>

      {/* 오른쪽: DTO 그대로 표기 */}
      <div className={styles.right}>
        <h1 className={styles.title}>{detail.prfnm}</h1>

        <div className={styles.infoRows}>
          <div className={styles.infoRow}>
            <span className={styles.label}>공연장소</span>
            <span className={styles.value}>{detail.fcltynm}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>공연기간</span>
            <span className={styles.value}>
              {detail.prfpdfrom === detail.prfpdto
                ? formatDate(detail.prfpdfrom)
                : `${formatDate(detail.prfpdfrom)} ~ ${formatDate(detail.prfpdto)}`}
            </span>
          </div>
          {detail.runningTime && (
            <div className={styles.infoRow}>
              <span className={styles.label}>러닝타임</span>
              <span className={styles.value}>{detail.runningTime}</span>
            </div>
          )}
          {detail.prfage && (
            <div className={styles.infoRow}>
              <span className={styles.label}>관람연령</span>
              <span className={styles.value}>{detail.prfage}</span>
            </div>
          )}
          <div className={styles.infoRow}>
            <span className={styles.label}>가격</span>
            <span className={styles.value}>{formatPrice(detail.ticketPrice)}</span>
          </div>
          {performers.length > 0 && (
            <div className={`${styles.infoRow} ${styles.fullRow}`}>
              <span className={styles.label}>출연</span>
              <span className={styles.value}>{performers.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FestivalInfoSection;
