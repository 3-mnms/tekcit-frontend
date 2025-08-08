import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/home/HomePage";
import Layout from "@/pages/home/LayoutTestPage";
import AnnouncementListPage from "@/pages/announcement/AnnouncementListPage";
import ProductManagePage from "@/pages/productManage/ProductManagePage";
import ProductRegisterPage from "@/pages/productRegist/ProductRegistPage";
import OperatManageHostPage from "@/pages/operatManageHost/OperatManageHostPage";
import OperatManageUserPage from "@/pages/operatManageUser/OperatManageUserPage";
import ProductDetailPage from "@/pages/productManage/ProductDetailPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> }, 
  { path: "/layout", element: <Layout/>},
  { path: "/operatManage/user", element: < OperatManageUserPage/>},
  { path: "/operatManage/host", element: < OperatManageHostPage/>},
  { path: "/productRegist", element: < ProductRegisterPage/>},
  { path: "/announcement", element: < AnnouncementListPage/>},
  { path: "/productManage", element: < ProductManagePage/>},
  { path: "/product-detail/:id", element: < ProductDetailPage/>},
]);
