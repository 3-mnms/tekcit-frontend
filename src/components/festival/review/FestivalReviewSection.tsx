// src/components/festival/review/FestivalReviewSection.tsx
import React, { useMemo, useState } from 'react'
import styles from './FestivalReviewSection.module.css'
import {
  useFestivalReviews,
  useMyFestivalReview,
  useCreateFestivalReview,
  useDeleteFestivalReview,
  useUpdateFestivalReview,
} from '@/models/festival/tanstack-query/useFestivalReview'
import type { ReviewSort } from '@/models/festival/reviewTypes'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/common/button/Button'
import { useTokenInfoQuery } from '@/shared/api/useTokenInfoQuery'
import { FaRegCommentDots, FaTrashAlt, FaEdit, FaUser } from 'react-icons/fa';
import Spinner from '@/components/common/spinner/Spinner'

type Props = { fid: string }

const reviewSchema = z.object({
  reviewContent: z
    .string()
    .trim()
    .max(512, '내용은 512자까지 작성할 수 있습니다.'),
})
type ReviewForm = z.infer<typeof reviewSchema>

const FestivalReviewSection: React.FC<Props> = ({ fid }) => {
  const [sort, setSort] = useState<ReviewSort>('desc')
  const [page, setPage] = useState(0)

  const { data, isLoading, isError } = useFestivalReviews(fid, sort, page)
  useMyFestivalReview(fid) // (선택) 내 리뷰 캐시 갱신용
  const createMut = useCreateFestivalReview(fid)
  const deleteMut = useDeleteFestivalReview()

  // 🔧 인라인 수정 상태
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const updateMut = useUpdateFestivalReview(fid, editingId ?? 0) // editingId가 바뀌면 훅 재설정

  // ✅ 서버에서 토큰 파싱해 { userId, role, name } 확보
  const { data: tokenInfo } = useTokenInfoQuery()
  const myUserId = tokenInfo?.userId ?? null
  const isLoggedIn = !!tokenInfo

  // 작성 폼
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema), mode: 'onChange' })
  const content = watch('reviewContent', '')
  const onSubmit = (form: ReviewForm) => {
    createMut.mutate(form, {
      onSuccess: () => {
        reset({ reviewContent: '' })
        alert('기대평이 등록되었습니다.')
      },
      onError: (e: any) => {
        const msg =
          e?.response?.data?.errorMessage ??
          e?.response?.data?.message ??
          '등록에 실패했어요. 잠시 후 다시 시도해 주세요.'
        alert(msg)
      },
    })
  }

  const onClickDelete = (rId: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    deleteMut.mutate(
      { fid, rId },
      {
        onSuccess: () => alert('삭제되었습니다.'),
        onError: (e: any) => {
          const msg =
            e?.response?.data?.errorMessage ??
            e?.response?.data?.message ??
            '삭제에 실패했어요. 잠시 후 다시 시도해 주세요.'
          alert(msg)
        },
      },
    )
  }

  // ✏️ 수정 시작(인라인)
  const startInlineEdit = (rId: number, currentText: string) => {
    setEditingId(rId)
    setEditingValue(currentText)
  }
  const cancelInlineEdit = () => {
    setEditingId(null)
    setEditingValue('')
  }

  const canEditSave = useMemo(() => {
    const t = editingValue.trim()
    return t.length >= 1 && t.length <= 512 && !updateMut.isPending
  }, [editingValue, updateMut.isPending])

  const saveInlineEdit = () => {
    if (!editingId) return
    updateMut.mutate(
      { reviewContent: editingValue.trim() },
      {
        onSuccess: () => {
          alert('수정되었습니다.')
          cancelInlineEdit()
        },
        onError: (e: any) => {
          const msg =
            e?.response?.data?.errorMessage ??
            e?.response?.data?.message ??
            '수정에 실패했어요. 잠시 후 다시 시도해 주세요.'
          alert(msg)
        },
      },
    )
  }

  // 목록/페이지 정보
  const items = data?.reviews?.content ?? []
  const totalPages = data?.reviews?.totalPages ?? 0
  const analyzeRaw = data?.analyze
  const analyze = React.useMemo(() => {
    const pos = Number(analyzeRaw?.positive ?? 0)
    const neg = Number(analyzeRaw?.negative ?? 0)
    const neu = Number(analyzeRaw?.neutral ?? 0)
    return {
      positive: isFinite(pos) ? Math.max(0, Math.min(100, pos)) : 0,
      negative: isFinite(neg) ? Math.max(0, Math.min(100, neg)) : 0,
      neutral: isFinite(neu) ? Math.max(0, Math.min(100, neu)) : 0,
      analyzeContent: analyzeRaw?.analyzeContent ?? '아직 분석을 표시할 데이터가 충분하지 않습니다.',
    }
  }, [analyzeRaw])

  // ✅ 현재 페이지에서 "내가 쓴 리뷰"를 최상단으로 재정렬
  const orderedItems = useMemo(() => {
    if (!items.length || myUserId == null) return items
    const mine: typeof items = []
    const others: typeof items = []
    items.forEach((it) =>
      Number(it.userId) === Number(myUserId) ? mine.push(it) : others.push(it),
    )
    return [...mine, ...others]
  }, [items, myUserId])

  const maskUserName = (name: string) => {
    if (!name) return ''
    if (name.length === 1) return name
    if (name.length === 2) return name[0] + '*'
    return name[0] + '*' + name.slice(2)
  }

  const busy =
    isLoading ||
    createMut.isPending ||
    updateMut.isPending

  return (
    <section className={`${styles.wrap} ${styles.wrapRelative}`}>
      {busy && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 pointer-events-auto">
          <Spinner />
        </div>
      )}
      <header className={styles.header}>
        <h2 className={styles.title}><FaRegCommentDots className={styles.icon} />기대평</h2>
      </header>


      {!isLoading && !isError && (
        <div className={styles.analyzeBox}>
          <p className={styles.analyzeContent}>{analyze.analyzeContent}</p>
          <div className={styles.analyzeBars}>
            <div className={styles.bar}>
              <span className={styles.label}><span className={styles.dotPositive} /> 긍정</span>
              <progress value={analyze.positive} max={100}></progress>
              <span className={styles.percent}>{analyze.positive.toFixed(1)}%</span>
            </div>
            <div className={styles.bar}>
              <span className={styles.label}><span className={styles.dotNegative} /> 부정</span>
              <progress value={analyze.negative} max={100}></progress>
              <span className={styles.percent}>{analyze.negative.toFixed(1)}%</span>
            </div>
            <div className={styles.bar}>
              <span className={styles.label}><span className={styles.dotNeutral} /> 중립</span>
              <progress value={analyze.neutral} max={100}></progress>
              <span className={styles.percent}>{analyze.neutral.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}


      {/* 작성 박스 (로그인 시에만) */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit(onSubmit)} className={`${styles.editor} ${styles.editorDashed}`}>

          <textarea
            className={styles.textarea}
            placeholder="이 공연에 대한 기대평을 남겨주세요 (최대 512자)"
            maxLength={512}
            {...register('reviewContent')}
          />
          {errors.reviewContent?.message && <p className={styles.error}>{errors.reviewContent.message}</p>}

          <div className={styles.editorFooter}>
            <span className={styles.charCount}>{content.length}/512자</span>
            <Button type="submit" className={styles.submitBtn} disabled={!isValid || createMut.isPending}>
              {createMut.isPending ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.loginHint}>로그인 후 기대평을 작성할 수 있어요 😸</div>
      )}

      {!isLoading && !isError && orderedItems.length > 0 && (
        <div className={styles.actions}>
          <select
            value={sort}
            onChange={(e) => {
              setPage(0)
              setSort(e.target.value as ReviewSort)
            }}
            className={styles.select}
            aria-label="정렬"
          >
            <option value="desc">최신순</option>
            <option value="asc">오래된순</option>
          </select>
        </div>
      )}

      {!isLoading && !isError && orderedItems.length === 0 &&
        <div className={`${styles.card2} ${styles.empty}`}>
          <div className={styles.emptyIcon} aria-hidden />
          <h3 className={styles.emptyTitle}>아직 등록된 기대평이 없습니다.</h3>
          <p className={styles.emptyDesc}>첫 기대평을 남겨주세요.</p>
        </div>
      }
      
      <div className={styles.list}>
        {isError && <div className={styles.error}>목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</div>}
        {isLoading && <div className={styles.cardLoading}>기대평을 불러오는 중...</div>}

        {orderedItems.map((rev, idx) => {
          const safeKey =
            (rev.reviewId != null ? `rid-${rev.reviewId}` : `u-${rev.userId}-t-${rev.createdAt}`) +
            `#${idx}`

          const isMine = myUserId != null && Number(myUserId) === Number(rev.userId)
          const isEditingThis = editingId != null && rev.reviewId === editingId

          const created = new Date(rev.createdAt)
          const updated = rev.updatedAt ? new Date(rev.updatedAt) : null
          const isEdited = !!(updated && updated.getTime() !== created.getTime())
          const displayTime = isEdited && updated ? updated : created

          return (
            <article key={safeKey} className={`${styles.item} ${styles.card}`}>
              <div className={styles.itemHead}>
                <div className={styles.userBlock}>
                  <div className={styles.avatar} aria-hidden>
                    <FaUser className={styles.avatarIcon} />
                  </div>
                  <div className={styles.userInfo}>
                    <p className={styles.user}>{maskUserName(rev.userName)}</p>
                    <time className={styles.time}>
                      {displayTime.toLocaleString()}
                      {isEdited && <span className={styles.edited}> (수정됨)</span>}
                    </time>
                  </div>
                </div>

                <div className={styles.itemActions}>
                  {isMine && !isEditingThis && rev.reviewId != null && (
                    <>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => startInlineEdit(rev.reviewId!, rev.reviewContent)}
                        title="기대평 수정"
                        aria-label="기대평 수정"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        onClick={() => onClickDelete(rev.reviewId!)}
                        disabled={deleteMut.isPending}
                        title="기대평 삭제"
                        aria-label="기대평 삭제"
                      >
                        <FaTrashAlt />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditingThis ? (
                <div className={styles.inlineEditor}>
                  <textarea
                    className={styles.textarea}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    placeholder="내용을 수정하세요 (최대 512자)"
                    maxLength={512}
                  />
                  <div className={styles.inlineEditorFooter}>
                    <span className={styles.charCount}>{editingValue.trim().length}/512자</span>
                    <Button
                      type="button"
                      className={styles.modalCancel}
                      onClick={cancelInlineEdit}
                      disabled={updateMut.isPending}
                    >
                      취소
                    </Button>
                    <Button
                      type="button"
                      className={styles.modalSave}
                      onClick={saveInlineEdit}
                      disabled={!canEditSave}
                    >
                      {updateMut.isPending ? '저장 중...' : '저장'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className={styles.content}>{rev.reviewContent}</p>
              )}
            </article>
          )
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
    </section>
  )
}

export default FestivalReviewSection
