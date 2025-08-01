import React from 'react';
import MenuItem from '@/components/my/dropdown/MenuItem';

const MenuItemTest: React.FC = () => {
  const handleClick = (label: string) => {
    alert(`${label} 클릭됨!`);
  };

  return (
    <div style={{ maxWidth: 300, margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: 10 }}>
      <MenuItem label="본인인증" onClick={() => handleClick('본인인증')} />
      <MenuItem label="내 티켓" onClick={() => handleClick('내 티켓')} />
      <MenuItem label="내 정보 수정" onClick={() => handleClick('내 정보 수정')} />
      <MenuItem label="북마크" onClick={() => handleClick('북마크')} />
    </div>
  );
};

export default MenuItemTest;
