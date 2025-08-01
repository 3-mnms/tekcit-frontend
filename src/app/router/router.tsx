import { createBrowserRouter } from "react-router-dom";
// import HomePage from "@/pages/home/button_test";
import TestPage from "@/pages/home/CategoryPage";

export const router = createBrowserRouter([
  { path: "/", element: <TestPage /> },
  
]);
