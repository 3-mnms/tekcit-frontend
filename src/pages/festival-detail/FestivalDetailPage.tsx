// src/pages/festival/FestivalDetailPage.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import Header from '@components/common/header/Header'
import Info from '@/components/festival/detail/FestivalInfoSection'
import Scheduler from '@/components/festival/detail/FestivalScheduleSection'
import InfoDetail from '@/components/festival/detail/FestivalInfoDetailSection'
import Statistics from '@/components/festival/detail/FestivalStatisticsSection'
import Review from '@/components/festival/review/FestivalReviewSection'
import { usePreloadImage } from '@/shared/config/usePreload'

import {
  useFestivalDetail,
  useIncreaseViews,
} from '@/models/festival/tanstack-query/useFestivalDetail'
import Spinner from '@/components/common/spinner/Spinner'
import styles from './FestivalDetailPage.module.css'

const FestivalDetailPage: React.FC = () => {
  const { fid } = useParams<{ fid: string }>()
  const { data: detail, isLoading, isError } = useFestivalDetail(fid ?? '')

  const { mutate: increaseViews } = useIncreaseViews()
  const firedRef = useRef(false)
  useEffect(() => {
    if (!fid) return
    if (firedRef.current) return
    firedRef.current = true
    increaseViews(fid)
  }, [fid, increaseViews])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  }, [fid])

  const [activeTab, setActiveTab] = useState<'info' | 'sale' | 'review'>('info')

  usePreloadImage(detail?.poster);

  if (!fid) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.singleColumn}>잘못된 접근이에요(식별자 없음) 😿</div>
      </div>
    )
  }
  if (isLoading || !detail) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.singleColumn}>
          상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요 😿
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* ✅ 하나의 2컬럼 그리드로 페이지 본문을 전부 감쌈 */}
      <div className={styles.layout}>
        {/* 좌측 메인 컬럼: Info + 탭 전체 */}
        <div className={styles.mainColumn}>
          {/* 전역 스피너로 처리하니 loading=false 전달 */}
          <Info detail={detail} loading={false} />

          <div className={styles.tabWrapper}>
            <div className={styles.tabMenu}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab('info')}
                className={`${styles.tab} ${activeTab === 'info' ? styles.active : ''}`}
              >
                공연정보
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab('sale')}
                className={`${styles.tab} ${activeTab === 'sale' ? styles.active : ''}`}
              >
                예매자통계
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab('review')}
                className={`${styles.tab} ${activeTab === 'review' ? styles.active : ''}`}
              >
                AI 기대평
              </div>
            </div>

            <div
              className={`${styles.tabContent} ${activeTab === 'info' ? styles.infoTabContent : ''
                }`}
            >
              {activeTab === 'info' && <InfoDetail />}
              {activeTab === 'sale' && <Statistics />}
              {activeTab === 'review' && <Review fid={fid} />}
            </div>
          </div>
        </div>

        {/* 우측 사이드 컬럼: 예매 달력 (스크롤 따라 sticky) */}
        <aside className={styles.sideColumn}>
          <div className={styles.schedulerSticky}>
            {/* ✅ 페이지에서 가져온 detail을 그대로 주입, 내부 로딩문구 억제 */}
            <Scheduler detailFromParent={detail} suppressLoading />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default FestivalDetailPage
