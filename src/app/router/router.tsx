import { createBrowserRouter } from 'react-router-dom'

// main
import MainPage from '@pages/home/MainPage'
import CategoryPage from '@pages/home/CategoryPage';
import SearchPage from '@/pages/home/SearchPage';
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
import TransferTicketPage from '@/pages/my/ticket/TransferTicketPage'
import EntranceCheckPage from '@/pages/my/ticket/EntranceCheckPage'

// transfer
import TransferPage from '@/pages/transfer/TransferPage'

// booking
import QueuePage from '@pages/booking/TicketQueuePage'
import OrderPage from '@pages/booking/TicketOrderPage'
import OrderInfoPage from '@pages/booking/TicketOrderInfoPage'

// payment
import BookingPaymentPage from '@/pages/payment/BookingPaymentPage'
import TransferPaymentPage from '@/pages/payment/transfer/TransferPaymentPage'
import TransferFeePaymentPage from '@/pages/payment/transfer/TransferFeePaymentPage'
import RefundPage from '@/pages/payment/refund/RefundPage'
import WalletPointPage from '@/pages/payment/pay/WalletPointPage'
import WalletChargePage from '@/pages/payment/pay/WalletChargePage'
import ResultPage from '@/pages/payment/result/ResultPage'
import TeckitJoinPage from '@/pages/payment/pay/TeckitJoinPage'

// admin & host
import HomePage from '@/pages/home/HomePage'
import Layout from '@/pages/home/LayoutTestPage'
import AnnouncementListPage from '@/pages/announcement/AnnouncementListPage'
import ProductManagePage from '@/pages/productManage/ProductManagePage'
import ProductRegisterPage from '@/pages/productRegist/ProductRegistPage'
import OperatManageHostPage from '@/pages/operatManageHost/OperatManageHostPage'
import OperatManageUserPage from '@/pages/operatManageUser/OperatManageUserPage'
import ProductDetailPage from '@/pages/productManage/ProductDetailPage'
import TicketHolderListPage from '@/pages/productManage/TicketHolderListPage'
import StatisticsPage from '@/pages/productManage/StatisticsPage'

export const router = createBrowserRouter([
  { path: '/', element: <MainPage /> },
  { path: '/category/:name', element: <CategoryPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: "/festival/:fid", element: <FestivalDetailPage /> },
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
          {
            path: 'transfer',
            children: [
              { path: '', element: <TransferTicketPage /> },
              { path: 'test', element: <TransferPage /> },
            ],
          },
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

  // booking
  {
    path: '/booking',
    children: [
      { path: ':fid/queue', element: <QueuePage /> },
      { path: ':fid', element: <OrderPage /> },
      { path: ':fid/order-info', element: <OrderInfoPage /> },
    ]
  },

  // payment
  {
    path: '/payment',
    children: [
      { path: '', element: <BookingPaymentPage /> },
      { path: 'result', element: <ResultPage /> },
      {
        path: 'wallet/join', // 최종 경로: /payment/wallet/join
        element: (
            <TeckitJoinPage />
        ),
      },
      {
        path: 'transfer',
        children: [
          { path: '', element: <TransferPaymentPage /> },
          { path: 'transfer-fee', element: <TransferFeePaymentPage /> },
        ],
      },
      {
        path: 'refund',
        children: [
          { path: '', element: <RefundPage /> },
        ],
      },
      {
        path: 'wallet-point',
        children: [
          { path: '', element: <WalletPointPage /> },
          { path: 'money-charge', element: <WalletChargePage /> },
        ],
      },
    ],
  },

  {
    path: '/admin',
    children: [
      { path: '', element: <ProductRegisterPage /> },
      { path: 'operatManage/user', element: <OperatManageUserPage /> },
      { path: 'operatManage/host', element: <OperatManageHostPage /> },
      { path: 'productRegist', element: <ProductRegisterPage /> },
      { path: 'productRegist/:fid', element: <ProductRegisterPage /> },
      { path: 'announcement', element: <AnnouncementListPage /> },
      { path: 'productManage', element: <ProductManagePage /> },
      { path: 'product-detail/:fid', element: <ProductDetailPage /> },
      { path: 'productManage/:fid/TicketHolderList', element: <TicketHolderListPage /> },
      { path: 'productManage/Statistics/:id', element: <StatisticsPage /> },

      { path: 'button', element: <HomePage /> },
      { path: 'layout', element: <Layout /> },
    ],
  },
])
