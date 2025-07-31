import { createBrowserRouter } from "react-router-dom";
// import HomePage from "@home/index";
import TestPage from "@home/test";
// import HomePage from "../../pages/home/index";

export const router = createBrowserRouter([
  { path: "/", element: <TestPage /> },
  

]);
