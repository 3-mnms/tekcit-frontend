// src/pages/HeaderTestPage.tsx
import React, { useState } from 'react';
import Header from '@components/common/Header'; // 업데이트된 Header 컴포넌트 불러오기, 삐약!
import { useNavigate } from 'react-router-dom'; // onLogout에서 navigate를 사용하므로 필요, 삐약!

const HeaderTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 로그인 상태를 시뮬레이션, 삐약!

  // Header 컴포넌트에 전달할 로그아웃 함수, 삐약!
  const handleLogout = () => {
    alert('로그아웃 처리되었습니다! (테스트용)');
    setIsLoggedIn(false); // 로그인 상태를 false로 변경, 삐약!
    navigate('/login'); // 로그인 페이지로 이동 (실제 라우터에 /login 경로가 있어야 함), 삐약!
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', fontSize: '24px', color: '#555' }}>
        로그아웃되었습니다. 로그인 페이지로 이동합니다, 삐약!
        <button onClick={() => navigate('/login')} style={{ marginLeft: '20px', padding: '10px 20px', fontSize: '18px' }}>
          로그인 페이지로
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* 업데이트된 Header 컴포넌트 렌더링! 삐약! */}
      <Header
        userName="정혜영" // 테스트할 사용자 이름, 삐약!
        onLogout={handleLogout} // 위에서 정의한 로그아웃 함수 연결, 삐약!
        // 다른 props (showAccessHistory, accessHistoryLink, sessionTime)는 Header 컴포넌트 내부에서 처리되거나
        // 필요에 따라 여기에 추가할 수 있습니다. 삐약!
      />

      <main style={{ padding: '20px', fontSize: '20px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>헤더 컴포넌트 테스트 페이지 (삐약!)</h2>
        <p>상단의 헤더를 확인하고, 세션 시간이 줄어드는 것을 보세요, 삐약!</p>
        <p>시간이 5분 이하로 남으면 글씨가 빨간색으로 변할 거예요, 삐약!</p>
        <p>시간 연장 버튼을 눌러 세션 시간을 초기화할 수 있어요, 삐약!</p>
        <p>시간이 모두 소진되거나 로그아웃 버튼을 누르면 로그아웃 처리됩니다, 삐약!</p>
        <div style={{ height: '800px', backgroundColor: '#e0e0e0', marginTop: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#666' }}>본문 내용 (스크롤 테스트용)</p>
        </div>
      </main>
    </div>
  );
};

export default HeaderTestPage;