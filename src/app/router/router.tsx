import { createBrowserRouter } from "react-router-dom";
// import HomePage from "@/pages/home/button_test";
import TestPage from "@home/test";
// import HomePage from "../../pages/home/index";

export const router = createBrowserRouter([
  { path: "/", element: <TestPage /> },
  

]);
