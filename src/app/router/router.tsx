import { createBrowserRouter } from 'react-router-dom'

// import TestPage from "@pages/home/test2";
// import TestPage from "@pages/my/dropdown/NotificationDropdown";
// import TestComponent from "@components/my/sidebar/Sidebar"
import MyPage from '@/pages/my/MyPage'
import Sidebar from '@components/my/sidebar/Sidebar'
import MyInfoPage from '@/pages/my/myInfo/MyInfoPage'
import DetailPage from '@/pages/my/myInfo/basicinfo/DetailPage'
import VerifyPasswordPage from '@/pages/my/myInfo/basicinfo/VerifyPasswordPage'
import EditInfoPage from '@/pages/my/myInfo/basicinfo/EditInfoPage'
import ChangePasswordPage from '@/pages/my/myInfo/ChangePasswordPage'
import LinkedAccounts from '@pages/my/myInfo/LinkedAccountsPage'
import AddressListPage from '@/pages/my/myInfo/adress/AddressListPage'
import AddressFormPage from '@/pages/my/myInfo/adress/AddressFormPage'

export const router = createBrowserRouter([
  // { path: "/", element: <TestPage /> },
  { path: '/', element: <Sidebar /> },

  {
    path: '/mypage',
    element: <MyPage />,
    children: [
      { path: 'myinfo', element: <MyInfoPage /> },
      { path: 'myinfo/detail', element: <DetailPage /> },
      { path: 'verifypassword', element: <VerifyPasswordPage /> },
      { path: 'myinfo/detail/editinfo', element: <EditInfoPage /> },
      { path: 'myinfo/changepassword', element: <ChangePasswordPage /> },
      { path: 'myinfo/linkedaccount', element: <LinkedAccounts /> },
      {
        path: 'myinfo/address',
        children: [
          { path: '', element: <AddressListPage /> },
          { path: 'new', element: <AddressFormPage /> },
        ],
      },

      // { path: 'address', element: <AddressList /> },
      // { path: 'withdraw', element: <Withdraw /> },
      // { path: 'verification', element: <Verification /> },
      // { path: 'tickets', element: <TicketHistory /> },
      // { path: 'transfer', element: <Transfer /> },
      // { path: 'entry', element: <EntryView /> },
      // { path: 'bookmarks', element: <Bookmarks /> },
    ],
  },
])
