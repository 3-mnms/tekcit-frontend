import React from 'react'
import Header from '@components/common/header/Header' // 실제 Header 경로에 맞게 수정해줘
import Hot from '@/components/festival/main/HotSection'
import Category from '@/components/festival/main/CategorySection'
import KakaoPopupBridge from '@/components/auth/login/KakaoPopupBridge'
import Footer from '@/components/common/footer/Footer';

const MainPage: React.FC = () => {
  return (
    <div>
      {typeof window !== 'undefined' && !!window.opener && <KakaoPopupBridge status="existing" />}
      <Header />
      <Hot />
      <Category />
      <Footer />
    </div>
  )
}

export default MainPage
