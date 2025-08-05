import { createBrowserRouter } from "react-router-dom";

// import TestPage from "@pages/home/test2";
// import TestPage from "@/pages/home/CategoryPage";
// import TestComponent from "@components/my/sidebar/Sidebar"
// import MyPage from '@/pages/my/MyPage';
// import MyInfo from '@/pages/my/Info';
import FesInfo from '@/pages/festival-detail/FestivalDetailPage';

export const router = createBrowserRouter([
  // { path: "/", element: <TestPage /> },
  { path: "/", element: <FesInfo /> },

  {
  path: '/mypage',
  element: <FesInfo />,
  children: [
    // { path: 'info', element: <MyInfo /> },
    // { path: 'password', element: <ChangePassword /> },
    // { path: 'linked', element: <LinkedAccounts /> },
    // { path: 'address', element: <AddressList /> },
    // { path: 'withdraw', element: <Withdraw /> },
    // { path: 'verification', element: <Verification /> },
    // { path: 'tickets', element: <TicketHistory /> },
    // { path: 'transfer', element: <Transfer /> },
    // { path: 'entry', element: <EntryView /> },
    // { path: 'bookmarks', element: <Bookmarks /> },
  ],
}
]);
