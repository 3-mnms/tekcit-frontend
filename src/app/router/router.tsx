import { createBrowserRouter } from "react-router-dom";
import HomePage from "@components/payment/AddressForm";
// import HomePage from "../../pages/home/index";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
]);
