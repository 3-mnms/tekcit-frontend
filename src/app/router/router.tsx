import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/home/HomePage";
import Layout from "@/pages/home/LayoutTestPage";
import AnnouncementListPage from "@/pages/announcement/AnnouncementListPage";
import ProductManagePage from "@/pages/productManage/ProductManagePage";
import ProductRegisterPage from "@/pages/productRegist/ProductRegistPage";
import OperatManageHostPage from "@/pages/operatManageHost/OperatManageHostPage";
import OperatManageUserPage from "@/pages/operatManageUser/OperatManageUserPage";
import ProductDetailPage from "@/pages/productManage/ProductDetailPage";
import TicketHolderListPage from "@/pages/productManage/TicketHolderListPage";
import StatisticsPage from "@/pages/productManage/StatisticsPage";

export const router = createBrowserRouter([
  { path: "/", element: < ProductRegisterPage/>},
  { path: "/operatManage/user", element: < OperatManageUserPage/>},
  { path: "/operatManage/host", element: < OperatManageHostPage/>},
  { path: "/productRegist", element: < ProductRegisterPage/>},
  { path: "/announcement", element: < AnnouncementListPage/>},
  { path: "/productManage", element: < ProductManagePage/>},
  { path: "/product-detail/:id", element: < ProductDetailPage/>},
  { path: "/productManage/:id/TicketHolderList", element: < TicketHolderListPage/>},
  { path: "/productManage/Statistics/:id", element: < StatisticsPage/>},
  
  
  
  
  { path: "/button", element: <HomePage /> }, 
  { path: "/layout", element: <Layout/>},
]);
