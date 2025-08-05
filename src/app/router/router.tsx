import { createBrowserRouter } from 'react-router-dom'
import HomePage from '@components/payment/CardSimplePayment'
import WalletPayment from '@components/payment/WalletPayment'
import GeneralCardPayment from '@components/payment/GeneralCardPayment'
// import HomePage from '@components/payment/PaymentInfo'
// import HomePage from '@pages/payment/BookingPaymentPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {path: "/wallet", element: <WalletPayment />},
  {path: "/General", element: <GeneralCardPayment />},
])
