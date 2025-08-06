import { createBrowserRouter } from 'react-router-dom'

// mainpage
import HomePage from '@pages/home/MainPage'

// mypage
import MyPage from '@/pages/my/MyPage'
import MyInfoPage from '@/pages/my/myInfo/MyInfoPage'
import DetailPage from '@/pages/my/myInfo/basicinfo/DetailPage'
import VerifyPasswordPage from '@/pages/my/myInfo/basicinfo/VerifyPasswordPage'
import EditInfoPage from '@/pages/my/myInfo/basicinfo/EditInfoPage'
import ChangePasswordPage from '@/pages/my/myInfo/changepassword/ChangePasswordPage'
import LinkedAccounts from '@/pages/my/myInfo/linkedaccount/LinkedAccountsPage'
import AddressListPage from '@/pages/my/myInfo/adress/AddressListPage'
import AddressFormPage from '@/pages/my/myInfo/adress/AddressFormPage'
import WithdrawPage from '@/pages/my/myInfo/withdraw/WithdrawPage'

// payment
import BookingPaymentPage from '@pages/payment/BookingPaymentPage'
import PaymentCompletePage from '@pages/payment/PaymentCompletePage'
import PaymentFailPage from '@pages/payment/PaymentFailPage'
import TransferPaymentPage from '@pages/payment/TransferPaymentPage'
import TransferFeePaymentPage from '@pages/payment/TransferFeePaymentPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },

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
      { path: 'verifypassword', element: <VerifyPasswordPage /> },
    ],
  },

  // payment
  {
    path: '/payment',
    element: <BookingPaymentPage />,
  },
  {
    path: '/PaymentCompletePage',
    element: <PaymentCompletePage />,
  },
  {
    path: '/PaymentFailPage',
    element: <PaymentFailPage />,
  },
  {
    path: '/TransferPaymentPage',
    element: <TransferPaymentPage />,
  },
  {
    path: '/TransferFeePaymentPage',
    element: <TransferFeePaymentPage />,
  },
])
