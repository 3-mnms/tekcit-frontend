// src/pages/festival/FestivalDetailPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import Header from '@components/common/header/Header';
import Info from '@/components/festival/detail/FestivalInfoSection';
import Scheduler from '@/components/festival/detail/FestivalScheduleSection';
import InfoDetail from '@/components/festival/detail/FestivalInfoDetailSection';
import Statistics from '@/components/festival/detail/FestivalStatisticsSection';

import { useFestivalDetail, useIncreaseViews } from '@/models/festival/tanstack-query/useFestivalDetail';
import styles from './FestivalDetailPage.module.css';

type CardState = {
  fid?: string;
  title?: string;
  poster?: string;
  // 선택: 카드에서 이미 보냈다면 기간/장소도 프리뷰로 활용 가능
  prfpdfrom?: string;
  prfpdto?: string;
  fcltynm?: string;
};

const FestivalDetailPage: React.FC = () => {
  // ✅ 라우트 파라미터(fid) — "디테일에서 받는 1개"
  const { fid: fidParam } = useParams<{ fid: string }>();

  // ✅ 카드에서 넘어온 프리뷰 — "카드에서 보내는 3개(+)": fid/title/poster/(선택:기간/장소)
  const { state } = useLocation() as { state?: CardState };
  const preview = state ?? {};

  // ✅ 최종 fid: 라우트 > state 백업
  const fid = useMemo(() => fidParam || preview.fid, [fidParam, preview.fid]);

  // ✅ 상세조회 (GET /festivals/{fid})
  const { data, isLoading, isError } = useFestivalDetail(fid);

  // ✅ 조회수 증가 (POST /festivals/views/{fid}) — 중복 호출 방지
  const { mutate: increaseViews } = useIncreaseViews();
  const firedRef = useRef(false);
  useEffect(() => {
    if (!fid) return;
    if (firedRef.current) return; // React 18 StrictMode 대비
    firedRef.current = true;
    increaseViews(fid);
  }, [fid, increaseViews]);

  // ✅ 화면 표시용 머지 데이터 (프리뷰 → 실데이터)
  const title = data?.prfnm ?? preview.title ?? '공연 상세';
  const poster = data?.poster ?? preview.poster;
  const period =
    data?.prfpdfrom && data?.prfpdto
      ? data.prfpdfrom === data.prfpdto
        ? data.prfpdfrom
        : `${data.prfpdfrom} ~ ${data.prfpdto}`
      : preview.prfpdfrom && preview.prfpdto
        ? preview.prfpdfrom === preview.prfpdto
          ? preview.prfpdfrom
          : `${preview.prfpdfrom} ~ ${preview.prfpdto}`
        : undefined;
  const place = data?.fcltynm ?? preview.fcltynm;

  const [activeTab, setActiveTab] = useState<'info' | 'sale'>('info');

  if (!fid) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.contentWrapper}>
          잘못된 접근이에요(식별자 없음) 😿
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.pageWrapper}>
        <Header />
        <div className={styles.contentWrapper}>
          상세 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요 😿
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* 상단: 포스터/기본정보 + 우측 스케줄(스티키) */}
      <div className={styles.contentWrapper}>
        {/* ✅ Info 섹션에 필요한 값 전달 (프리뷰/실데이터 병합) */}
        <Info
          fid={fid}
          title={title}
          poster={poster}
          period={period}
          place={place}
          loading={isLoading}
          // 원한다면 전체 detail DTO도 넘겨서 내부에서 더 쓰게 할 수 있음
          detail={data}
        />

        <div className={styles.schedulerSticky}>
          {/* ✅ 스케줄은 일반적으로 fid만 있어도 API 호출 가능 */}
          <Scheduler fid={fid} />
        </div>
      </div>

      {/* 탭 메뉴 */}
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
        </div>

        {/* 선택된 탭 내용 */}
        <div className={styles.tabContent}>
          {activeTab === 'info' ? (
            // ✅ 상세/공지/주의사항 등: detail DTO와 fid 전달
            <InfoDetail fid={fid} detail={data} loading={isLoading} />
          ) : (
            // ✅ 통계: 보통 fid만으로 충분 (내부에서 useQuery)
            <Statistics fid={fid} />
          )}
        </div>
      </div>
    </div>
  );
};

export default FestivalDetailPage;
