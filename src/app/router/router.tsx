import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/home/HomePage";
import Header from "@/pages/home/HeaderTestPage";
import Sidebar from "@/pages/home/SidebarTest";
import Layout from "@/pages/home/LayoutTestPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> }, 
  { path: "/header", element: <Header /> }, 
  { path: "/sidebar", element: <Sidebar /> }, 
  { path: "/layout", element: <Layout/>},
]);
