import { createBrowserRouter } from "react-router-dom";
import HomePage from "@home/index";
// import HomePage from "../../pages/home/index";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  

]);
