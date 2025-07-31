import React from 'react';
import Button from '@components/common/button/Button'; // 너 위치에 맞게 경로 조정!

const ButtonPreview = () => {
  const handleClick = () => {
    alert('버튼 클릭됨! 🐾');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Button className="w-60 h-14" onClick={handleClick}>
        로그인
      </Button>
    </div>
  );
};

export default ButtonPreview;
