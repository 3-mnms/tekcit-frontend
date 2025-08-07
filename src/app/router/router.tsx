import { createBrowserRouter } from 'react-router-dom'

// mainpage
import HomePage from '@pages/home/MainPage'

// mypage
import MyPage from '@/pages/my/MyPage'
// import Sidebar from '@components/my/sidebar/Sidebar'
import SignupPage from '@/pages/my/dropdown/UserDropdown'
import MyInfoPage from '@/pages/my/myInfo/MyInfoPage'
import DetailPage from '@/pages/my/myInfo/basicinfo/DetailPage'
import VerifyPasswordPage from '@/pages/my/myInfo/basicinfo/VerifyPasswordPage'
import EditInfoPage from '@/pages/my/myInfo/basicinfo/EditInfoPage'
import ChangePasswordPage from '@/pages/my/myInfo/changepassword/ChangePasswordPage'
import LinkedAccounts from '@/pages/my/myInfo/linkedaccount/LinkedAccountsPage'
import AddressListPage from '@/pages/my/myInfo/adress/AddressListPage'
import AddressFormPage from '@/pages/my/myInfo/adress/AddressFormPage'
import WithdrawPage from '@/pages/my/myInfo/withdraw/WithdrawPage'
import BookmarkPage from '@/pages/my/myInfo/bookmark/BookmarkPage'
import TicketHistoryPage from '@/pages/my/ticket/TicketHistoryPage'
import MyTicketPage from '@/pages/my/ticket/MyTicketPage'
import TicketDetailPage from '@/pages/my/ticket/TicketDetailPage'
import TransferTicketPage from '@/pages/my/ticket/TransferTicketPage'
import EntranceCheckPage from '@/pages/my/ticket/EntranceCheckPage'

// payment
import BookingPaymentPage from '@pages/payment/BookingPaymentPage'
import PaymentCompletePage from '@pages/payment/PaymentCompletePage'
import PaymentFailPage from '@pages/payment/PaymentFailPage'
import TransferPaymentPage from '@pages/payment/TransferPaymentPage'
import TransferFeePaymentPage from '@pages/payment/TransferFeePaymentPage'
import PayPointPage from '@pages/payment/PayPointPage'
import MoneyChargePage from '@pages/payment/MoneyChargePage'

export const router = createBrowserRouter([
  { path: '/', element: <SignupPage /> },

  {
    path: '/mypage',
    element: <MyPage />,
    children: [
      {
        path: 'myinfo',
        children: [
          { path: '', element: <MyInfoPage /> },
          { path: 'detail', element: <DetailPage /> },
          { path: 'detail/editinfo', element: <EditInfoPage /> },
          { path: 'changepassword', element: <ChangePasswordPage /> },
          { path: 'linkedaccount', element: <LinkedAccounts /> },
          { path: 'verifypassword', element: <VerifyPasswordPage /> },
          {
            path: 'address',
            children: [
              { path: '', element: <AddressListPage /> },
              { path: 'new', element: <AddressFormPage /> },
            ],
          },
          { path: 'withdraw', element: <WithdrawPage /> },
        ],
      },
      { path: 'bookmark', element: <BookmarkPage /> },
      {
        path: 'ticket',
        children: [
          { path: '', element: <MyTicketPage /> },
          { path: 'history', element: <TicketHistoryPage /> },
          { path: 'detail/:id', element: <TicketDetailPage /> },
          { path: 'transfer', element: <TransferTicketPage /> },
          { path: 'entrancecheck', element: <EntranceCheckPage /> },
          // {
          //   path: 'address',
          //   children: [
          //     { path: '', element: <AddressListPage /> },
          //     { path: 'new', element: <AddressFormPage /> },
          //   ],
          // },
        ],
      },
    ],
  },

  // payment
  {
    path: '/payment',
    children: [
      { path: '', element: <BookingPaymentPage /> }, // /payment
      { path: 'complete', element: <PaymentCompletePage /> }, // /payment/complete
      { path: 'fail', element: <PaymentFailPage /> }, // /payment/fail
      { path: 'transfer', element: <TransferPaymentPage /> }, // /payment/transfer
      { path: 'transfer-fee', element: <TransferFeePaymentPage /> }, // /payment/transfer-fee
      { path: 'paypoint', element: <PayPointPage /> },
      { path: 'moneyCharge', element: <MoneyChargePage /> },
    ],
  },
])
