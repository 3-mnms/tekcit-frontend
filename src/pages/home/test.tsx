import React from 'react';
import Header from '@components/common/header/Header'; // 실제 Header 경로에 맞게 수정해줘
import '@fortawesome/fontawesome-free/css/all.min.css';

const Test: React.FC = () => {
  const handleSearch = (keyword: string) => {
    alert(`검색된 키워드: ${keyword}`);
  };

  return (
    <div>
      <Header isLoggedIn={false} onSearch={handleSearch} />
    </div>
  );
};

export default Test;