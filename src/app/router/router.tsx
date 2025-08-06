import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/home/HomePage";
import Layout from "@/pages/home/LayoutTestPage";
import OperatManageUser from "@/pages/admin/OperatManageUserPage";
import OperatManageHost from "@/pages/admin/OperatManageHostPage";
import ProductRegister from "@/pages/host/ProductRegistPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> }, 
  { path: "/layout", element: <Layout/>},
  { path: "/operatManage/user", element: < OperatManageUser/>},
  { path: "/operatManage/host", element: < OperatManageHost/>},
  { path: "/productRegist", element: < ProductRegister/>},

]);
