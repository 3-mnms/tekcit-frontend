import { createBrowserRouter } from 'react-router-dom'

// mainpage
import HomePage from '@pages/home/MainPage'

//auth
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import FindIdPage from '@/pages/auth/find/FindIdPage'
import FindPasswordPage from '@/pages/auth/find/FindPasswordPage'
import ResetPasswordPage from '@/pages/auth/find/ResetPasswordPage'

// mypage
import MyPage from '@/pages/my/MyPage'
// import Sidebar from '@components/my/sidebar/Sidebar'
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

// payment
import BookingPaymentPage from '@pages/payment/BookingPaymentPage'
import PaymentCompletePage from '@/pages/payment/pay/PaymentCompletePage'
import PaymentFailPage from '@/pages/payment/pay/PaymentFailPage'
import TransferPaymentPage from '@/pages/payment/transfer/TransferPaymentPage'
import TransferFeePaymentPage from '@/pages/payment/transfer/TransferFeePaymentPage'
import PayPointPage from '@/pages/payment/pay/PayPointPage'
import CancelRequestPage from '@/pages/payment/refund/CancelRequestPage'
import TransferSuccessPage from '@/pages/payment/transfer/TransferSuccessPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/find-id', element: <FindIdPage /> },
  { path: '/find-password', element: <FindPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

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
      { path: 'cancelRequest', element: <CancelRequestPage /> },
      { path: 'transfer-success', element: <TransferSuccessPage /> },
    ],
  },
])
