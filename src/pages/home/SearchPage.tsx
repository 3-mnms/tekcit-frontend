// src/pages/search/SearchPage.tsx
import React from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import Header from '@components/common/header/Header'
import Filter from '@components/festival/search/FilterPanel'
import Result from '@components/festival/search/ResultPanel'
import styles from './SearchPage.module.css'

const DEFAULT_STATUSES = ['공연예정', '공연중']

const SearchPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ 1) 렌더 전에 쿼리 정규화 (가드)
  const params = new URLSearchParams(location.search)
  const hasStatus = !!params.get('status')
  if (!hasStatus) {
    params.set('status', DEFAULT_STATUSES.join(','))
    if (!params.get('page')) params.set('page', '1')
    return <Navigate to={`/search?${params.toString()}`} replace />
  }

  // ✅ 2) 헤더에서 검색 시 status 유지(없으면 기본값 주입) + page=1
  const handleHeaderSearch = (kw: string) => {
    const p = new URLSearchParams(location.search)
    p.set('keyword', kw.trim())
    p.set('page', '1')
    if (!p.get('status')) p.set('status', DEFAULT_STATUSES.join(','))
    navigate(`/search?${p.toString()}`, { replace: false })
  }

  return (
    <>
      <Header onSearch={handleHeaderSearch} />
      <div className={styles.page}>
        <aside className={styles.filterCol}>
          <div className={styles.colScroll}>
            <Filter />
          </div>
        </aside>

        <main className={styles.resultsCol}>
          <div className={styles.colScroll}>
            <Result />
          </div>
        </main>
      </div>
    </>
  )
}

export default SearchPage
