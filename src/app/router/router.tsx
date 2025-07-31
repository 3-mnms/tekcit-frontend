import { createBrowserRouter } from "react-router-dom";
import HomePage from "@pages/auth/LoginPage";
// import HomePage from "../../pages/home/index";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  

]);
