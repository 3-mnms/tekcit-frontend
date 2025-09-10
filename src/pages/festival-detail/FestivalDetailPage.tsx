// src/pages/festival/FestivalDetailPage.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import Header from '@components/common/header/Header'
import Info from '@/components/festival/detail/FestivalInfoSection'
import Scheduler from '@/components/festival/detail/FestivalScheduleSection'
import InfoDetail from '@/components/festival/detail/FestivalInfoDetailSection'
import Statistics from '@/components/festival/detail/FestivalStatisticsSection'
import Review from '@/components/festival/review/FestivalReviewSection';

import {
  useFestivalDetail,
  useIncreaseViews,
} from '@/models/festival/tanstack-query/useFestivalDetail'
import styles from './FestivalDetailPage.module.css'

const FestivalDetailPage: React.FC = () => {
  const { fid } = useParams<{ fid: string }>()
  const navigate = useNavigate() // 팝업창에서 여기로 이동
  const { data: detail, isLoading, isError } = useFestivalDetail(fid ?? '')

  const { mutate: increaseViews } = useIncreaseViews()
  const firedRef = useRef(false)
  useEffect(() => {
    if (!fid) return
    if (firedRef.current) return
    firedRef.current = true
    increaseViews(fid)
  }, [fid, increaseViews])

  const [activeTab, setActiveTab] = useState<'info' | 'sale' | 'review'>('info')

  // 민정 추가 (팝업창 닫히면 이 페이지(부모 페이지)로 이동해서 결과 페이지로 이동시킴)
  useEffect(() => {
    const handlePopupMessage = (event: MessageEvent) => {
      // 보안: 동일 origin만 허용
      if (event.origin !== window.location.origin) return
      
      if (!event.data || typeof event.data !== 'object') return

      console.log('📨 [FestivalDetailPage] 팝업 메시지 수신:', event.data)

      // 결제 성공 메시지
      if (event.data.type === 'PAYMENT_SUCCESS') {
        console.log('✅ [FestivalDetailPage] 결제 성공 감지')
        
        // 결제 성공 페이지로 이동
        navigate('/payment/result?type=booking&status=success')
        return
      }

      // 결제 실패 메시지
      if (event.data.type === 'PAYMENT_FAILURE') {
        console.log('❌ [FestivalDetailPage] 결제 실패 감지')
        
        // 결제 실패 페이지로 이동
        navigate('/payment/result?type=booking&status=fail')
        return
      }

      // 대기열/예매 관련 메시지도 필요시 추가 가능
      if (event.data.type === 'BOOKING_COMPLETE') {
        console.log('🎫 [FestivalDetailPage] 예매 완료')
        // 필요시 예매 완료 처리
        return
      }
    }

    window.addEventListener('message', handlePopupMessage)
    
    return () => {
      window.removeEventListener('message', handlePopupMessage)
    }
  }, [navigate])

  if (!fid) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.singleColumn}>잘못된 접근이에요(식별자 없음) 😿</div>
      </div>
    )
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
          <Info detail={detail} loading={isLoading} />

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
                관람평
              </div>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'info' && <InfoDetail />}
              {activeTab === 'sale' && <Statistics fid={fid} />}
              {activeTab === 'review' && <Review fid={fid} />}
            </div>
          </div>
        </div>

        {/* 우측 사이드 컬럼: 예매 달력 (스크롤 따라 sticky) */}
        <aside className={styles.sideColumn}>
          <div className={styles.schedulerSticky}>
            <Scheduler />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default FestivalDetailPage
