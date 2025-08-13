import { createBrowserRouter } from 'react-router-dom'

// mainpage
import HomePage from '@pages/home/MainPage'
import CategoryPage from '@pages/home/CategoryPage'
import FestivalDetailPage from '@pages/festival-detail/FestivalDetailPage'

//auth
import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import FindIdPage from '@/pages/auth/find/FindIdPage'
import FindPasswordPage from '@/pages/auth/find/FindPasswordPage'
import ResetPasswordPage from '@/pages/auth/find/ResetPasswordPage'
import KakaoSignupPage from '@/pages/auth/KakaoSignupPage'
import KakaoAuthorizeGate from '@/components/auth/signup/KakaoAuthorizeGate'

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
import BookingPaymentPage from '@/pages/payment/BookingPaymentPage'
import PaymentSuccessPage from '@/pages/payment/pay/PaymentSuccessPage'
import PaymentFailPage from '@/pages/payment/pay/PaymentFailPage'
import TransferPaymentPage from '@/pages/payment/transfer/TransferPaymentPage'
import TransferSuccessPage from '@/pages/payment/transfer/TransferSuccessPage'
import TransferPaymentFailPage from '@/pages/payment/transfer/TransferPaymentFailPage'
import TransferFeePaymentPage from '@/pages/payment/transfer/TransferFeePaymentPage'
import FeeSuccessPage from '@/pages/payment/transfer/FeeSuccessPage'
import FeeFailPage from '@/pages/payment/transfer/FeeFailPage'
import RefundPage from '@/pages/payment/refund/RefundPage'
import RefundSuccessPage from '@/pages/payment/refund/RefundSuccessPage'
import RefundFailPage from '@/pages/payment/refund/RefundFailPage'
import WalletPointPage from '@/pages/payment/pay/WalletPointPage'
import WalletChargePage from '@/pages/payment/pay/WalletChargePage'
import ChargeSuccessPage from '@/pages/payment/pay/ChargeSuccessPage'
import ChargeFailPage from '@/pages/payment/pay/ChargeFailPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {
    path: '/category/:name',
    element: <CategoryPage />,
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/signup', element: <SignupPage /> },
  {
    path: '/auth/signup/kakao',
    element: <KakaoAuthorizeGate />, // provider 검사 + 가드
    children: [{ index: true, element: <KakaoSignupPage /> }],
  },
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
      { path: '', element: <BookingPaymentPage /> },
      { path: 'payment-success', element: <PaymentSuccessPage /> },
      { path: 'payment-fail', element: <PaymentFailPage /> },
      {
        path: 'transfer',
        children: [
          { path: '', element: <TransferPaymentPage /> },
          { path: 'transfer-success', element: <TransferSuccessPage /> },
          { path: 'transfer-fail', element: <TransferPaymentFailPage /> },
          { path: 'transfer-fee', element: <TransferFeePaymentPage /> },
          { path: 'fee-success', element: <FeeSuccessPage /> },
          { path: 'fee-fail', element: <FeeFailPage /> },
        ],
      },
      {
        path: 'refund',
        children: [
          { path: '', element: <RefundPage /> },
          { path: 'refund-success', element: <RefundSuccessPage /> },
          { path: 'refund-fail', element: <RefundFailPage /> },
        ],
      },
      {
        path: 'wallet-point',
        children: [
          { path: '', element: <WalletPointPage /> },
          { path: 'money-charge', element: <WalletChargePage /> },
          { path: 'charge-success', element: <ChargeSuccessPage /> },
          { path: 'charge-fail', element: <ChargeFailPage /> },
        ],
      },
    ],
  },
])
