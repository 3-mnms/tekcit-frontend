// src/components/layout/Header.tsx
import React, { useEffect, useRef, useState } from 'react'
import styles from './Header.module.css'
import logo from '@shared/assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFestivalCategories } from '@shared/api/festival/FestivalApi'
import { useAuthStore } from '@/shared/storage/useAuthStore'
import UserDropdown from '@/pages/my/dropdown/UserDropdown' // ✅ 드롭다운

interface HeaderProps {
  onSearch: (keyword: string) => void
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const { isLoggedIn, user } = useAuthStore()

  // ✅ 드롭다운 상태 & 외부클릭 닫기
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleSearch = () => {
    if (keyword.trim()) onSearch(keyword.trim())
  }

  const { data: categories } = useQuery({
    queryKey: ['festivalCategories'],
    queryFn: getFestivalCategories,
  })

  const groupCategories = (original: string[] = []) => {
    const g = new Set<string>()
    original.forEach((c) => {
      if (['대중무용', '무용(서양/한국무용)'].includes(c)) g.add('무용')
      else if (c === '대중음악') g.add('대중음악')
      else if (['뮤지컬', '연극'].includes(c)) g.add('뮤지컬/연극')
      else if (['서양음악(클래식)', '한국음악(국악)'].includes(c)) g.add('클래식/전통음악')
      else g.add(c)
    })
    return Array.from(g)
  }
  const groupedCategories = groupCategories(categories)

  const getDisplayName = () => {
    if (!user) return ''
    if (user.role === 'user') return `${user.name} 님`
    if (user.role === 'host') return '호스트 님'
    if (user.role === 'admin') return '관리자 님'
    return ''
  }

  return (
    <header className={styles.header}>
      {/* 왼쪽: 로고 + 카테고리 */}
      <div className={styles.left}>
        <img
          src={logo}
          alt="tekcit logo"
          className={styles.logo}
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
        <div className={styles.categoryList}>
          {groupedCategories.map((cat) => (
            <span key={cat}>{cat}</span>
          ))}
        </div>
      </div>

      {/* 가운데: 검색 */}
      <div className={styles.center}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="검색창"
            className={styles.searchInput}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <i className="fa-solid fa-magnifying-glass" onClick={handleSearch} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* 오른쪽: 로그인 / 드롭다운 */}
      <div className={styles.right} ref={dropdownRef}>
        {isLoggedIn ? (
          <>
            <button
              type="button"
              className={styles.rightButton}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <i className="fa-regular fa-user" />
              <span>{getDisplayName()}</span>
            </button>

            {open && (
              <div className={styles.dropdownWrapper}>
                <UserDropdown />
              </div>
            )}
          </>
        ) : (
          <div className={styles.rightButton} onClick={() => navigate('/login')}>
            <i className="fa-regular fa-user" />
            <span>로그인</span>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header