import React, { useMemo, useState } from 'react';
import styles from './FestivalReviewSection.module.css';
import { useAuthStore } from '@/shared/storage/useAuthStore';
import {
  useFestivalReviews,
  useMyFestivalReview,
  useCreateFestivalReview,
  useDeleteFestivalReview,
  useUpdateFestivalReview,
} from '@/models/festival/tanstack-query/useFestivalReview';
import type { ReviewSort } from '@/models/festival/reviewTypes';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/common/button/Button';

type Props = { fid: string };

const reviewSchema = z.object({
  reviewContent: z
    .string()
    .trim()
    .min(1, '한 글자 이상 입력해 주세요.')
    .max(512, '내용은 512자까지 작성할 수 있어요.'),
});
type ReviewForm = z.infer<typeof reviewSchema>;

const FestivalReviewSection: React.FC<Props> = ({ fid }) => {
  const [sort, setSort] = useState<ReviewSort>('desc');
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useFestivalReviews(fid, sort, page);
  useMyFestivalReview(fid); // (선택) 내 리뷰 디스패치 용
  const createMut = useCreateFestivalReview(fid);
  const deleteMut = useDeleteFestivalReview();

  // 🔧 수정 모달 상태
  const [editOpen, setEditOpen] = useState(false);
  const [editRid, setEditRid] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const updateMut = useUpdateFestivalReview(fid, editRid ?? 0); // rId가 바뀌면 훅도 재설정됨

  const myUserId = useAuthStore((s) => s.user?.userId ?? null);
  const accessToken = useAuthStore((s) => s.accessToken);

  // 작성 폼
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema), mode: 'onChange' });

  const onSubmit = (form: ReviewForm) => {
    createMut.mutate(form, {
      onSuccess: () => {
        reset({ reviewContent: '' });
        alert('기대평이 등록되었어요!');
      },
      onError: (e: any) => {
        const msg =
          e?.response?.data?.errorMessage ??
          e?.response?.data?.message ??
          '등록에 실패했어요. 잠시 후 다시 시도해 주세요.';
        alert(msg);
      },
    });
  };

  const onClickDelete = (rId: number) => {
    if (!confirm('정말 삭제할까요? 삭제 후 되돌릴 수 없어요.')) return;
    deleteMut.mutate(
      { fid, rId },
      {
        onSuccess: () => alert('삭제되었습니다.'),
        onError: (e: any) => {
          const msg =
            e?.response?.data?.errorMessage ??
            e?.response?.data?.message ??
            '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.';
          alert(msg);
        },
      }
    );
  };

  // ✏️ 수정 버튼 → 모달 오픈
  const openEditModal = (rId: number, currentText: string) => {
    setEditRid(rId);
    setEditValue(currentText);
    setEditOpen(true);
  };
  const closeEditModal = () => {
    setEditOpen(false);
    setEditRid(null);
    setEditValue('');
  };

  // ✏️ 수정 제출
  const canEditSave = useMemo(() => {
    const t = editValue.trim();
    return t.length >= 1 && t.length <= 512 && !updateMut.isPending;
  }, [editValue, updateMut.isPending]);

  const onSubmitEdit = () => {
    if (!editRid) return;
    const payload = { reviewContent: editValue.trim() };
    updateMut.mutate(payload, {
      onSuccess: () => {
        alert('수정되었습니다.');
        closeEditModal();
      },
      onError: (e: any) => {
        const msg =
          e?.response?.data?.errorMessage ??
          e?.response?.data?.message ??
          '수정에 실패했어요. 잠시 후 다시 시도해 주세요.';
        alert(msg);
      },
    });
  };

  const items = data?.reviews?.content ?? [];
  const totalPages = data?.reviews?.totalPages ?? 0;
  const analyze = data?.analyze;

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h2 className={styles.title}>관람평</h2>

        <div className={styles.actions}>
          <select
            value={sort}
            onChange={(e) => {
              setPage(0);
              setSort(e.target.value as ReviewSort);
            }}
            className={styles.select}
            aria-label="정렬"
          >
            <option value="desc">최신순</option>
            <option value="asc">오래된순</option>
          </select>
        </div>
      </header>

      {analyze && (
        <div className={styles.analyzeBox}>
          <p className={styles.analyzeContent}>{analyze.analyzeContent}</p>
          <div className={styles.analyzeBars}>
            <div className={styles.bar}>
              <span className={styles.label}>긍정</span>
              <progress value={analyze.positive} max={100}></progress>
              <span className={styles.percent}>{analyze.positive.toFixed(1)}%</span>
            </div>
            <div className={styles.bar}>
              <span className={styles.label}>부정</span>
              <progress value={analyze.negative} max={100}></progress>
              <span className={styles.percent}>{analyze.negative.toFixed(1)}%</span>
            </div>
            <div className={styles.bar}>
              <span className={styles.label}>중립</span>
              <progress value={analyze.neutral} max={100}></progress>
              <span className={styles.percent}>{analyze.neutral.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 작성 박스 (로그인 시에만) */}
      {accessToken ? (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.editor}>
          <textarea
            className={styles.textarea}
            placeholder="이 공연에 대한 기대평을 남겨주세요 (최대 512자)"
            {...register('reviewContent')}
          />
          {errors.reviewContent?.message && (
            <p className={styles.error}>{errors.reviewContent.message}</p>
          )}
          <div className={styles.editorFooter}>
            <Button
              type="submit"
              className={styles.submitBtn}
              disabled={!isValid || createMut.isPending}
            >
              {createMut.isPending ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.loginHint}>로그인 후 기대평을 작성할 수 있어요 😸</div>
      )}

      {/* 목록 */}
      <div className={styles.list}>
        {isLoading && <div className={styles.skeleton}>기대평을 불러오는 중...</div>}
        {isError && (
          <div className={styles.error}>목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</div>
        )}
        {!isLoading && !isError && items.length === 0 && (
          <div className={styles.empty}>아직 기대평이 없어요.</div>
        )}

        {items.map((rev, idx) => {
          const safeKey =
            (rev.reviewId != null ? `rid-${rev.reviewId}` : `u-${rev.userId}-t-${rev.createdAt}`) +
            `#${idx}`;

          const isMine = myUserId === rev.userId;

          return (
            <article key={safeKey} className={styles.item}>
              <div className={styles.meta}>
                <span className={styles.user}>USER #{rev.userId}</span>
                <time className={styles.time}>{new Date(rev.createdAt).toLocaleString()}</time>

                {/* ✏️ 수정 / 🗑️ 삭제 : 본인 것만 */}
                {isMine && (
                  <>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => openEditModal(rev.reviewId!, rev.reviewContent)}
                      title="기대평 수정"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className={styles.delBtn}
                      onClick={() => onClickDelete(rev.reviewId!)}
                      disabled={deleteMut.isPending}
                      title="기대평 삭제"
                    >
                      {deleteMut.isPending ? '삭제 중...' : '삭제'}
                    </button>
                  </>
                )}
              </div>
              <p className={styles.content}>{rev.reviewContent}</p>
            </article>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav className={styles.pager} aria-label="pagination">
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            이전
          </button>
          <span className={styles.pageInfo}>
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            다음
          </button>
        </nav>
      )}

      {/* ✏️ 수정 모달 */}
      {editOpen && (
        <div className={styles.backdrop} onClick={closeEditModal} aria-hidden="true">
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>기대평 수정</h3>
            <textarea
              className={styles.modalTextarea}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="내용을 수정하세요 (최대 512자)"
            />
            <div className={styles.modalFooter}>
              <button type="button" className={styles.modalCancel} onClick={closeEditModal}>
                취소
              </button>
              <button
                type="button"
                className={styles.modalSave}
                onClick={onSubmitEdit}
                disabled={!canEditSave}
              >
                {updateMut.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FestivalReviewSection;
