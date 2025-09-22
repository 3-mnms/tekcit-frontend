// src/pages/admin/NoticeListPage.tsx
import React from 'react';
import Layout from '@components/layout/Layout';

const NoticeListPage: React.FC = () => {
  return (
    <Layout subTitle="공지사항 목록"> {/* subTitle을 전달하는지 확인! */}
      <div style={{ padding: '24px' }}>
        <h1>공지사항 목록 페이지 내용</h1>
        <p>이곳에 실제 공지사항 테이블이나 리스트가 들어갈 거예요, 삐약!</p>
        <div style={{ height: '1500px', backgroundColor: '#f0f0f0' }}>
          <p>스크롤 테스트용 긴 콘텐츠</p>
        </div>
      </div>
    </Layout>
  );
};

export default NoticeListPage;