import { createBrowserRouter } from "react-router-dom";

// import TestPage from "@pages/home/test2";
// import TestPage from "@pages/my/dropdown/NotificationDropdown";
// import TestComponent from "@components/my/sidebar/Sidebar"
import MyPage from '@/pages/my/MyPage';
import InfoPage from '@/pages/my/myInfo/Info';
import InfoDetailPage from '@/pages/my/myInfo/InfoDetailPage';

export const router = createBrowserRouter([
  // { path: "/", element: <TestPage /> },
  // { path: "/", element: <TestComponent /> },

  {
  path: '/mypage',
  element: <MyPage />,
  children: [
    { path: 'info', element: <InfoPage /> },
    { path: 'info/detail', element: <InfoDetailPage /> },
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
