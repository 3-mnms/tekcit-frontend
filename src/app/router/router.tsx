import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/home/HomePage";
import Layout from "@/pages/home/LayoutTestPage";
import OperatManageUser from "@/pages/admin/OperatManageUserPage";
import OperatManageHost from "@/pages/admin/OperatManageHostPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> }, 
  { path: "/layout", element: <Layout/>},
  { path: "/operatManage/user", element: < OperatManageUser/>},
    { path: "/operatManage/host", element: < OperatManageHost/>},

]);
