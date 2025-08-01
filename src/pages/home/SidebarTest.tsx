// src/pages/SidebarTest.tsx
import React from "react";
import Sidebar from "@components/common/Sidebar";

const SidebarTest: React.FC = () => {
  const menuItems = [
    { path: "/productRegist", name: "상품 등록" },
    { path: "/productManage", name: "상품 관리" },
    { path: "/announcement", name: "공지사항" },
    { name: "운영 관리", subMenu: [
      {path: "/operatManage/host", name: "주최자"},
      {path: "/operatManage/user", name: "사용자"},
    ]}
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        menuItems={menuItems}
        userName="정혜영"
        userEmail="abc1234@test.com"
      />

      <div style={{ flex: 1, padding: "150px", marginLeft: "18%" }}>
        <h1>사이드바 테스트 페이지</h1>
        <p>여기에 메인 콘텐츠가 들어갑니다 삐약!</p>
      </div>
    </div>
  );
};

export default SidebarTest;
