import { createBrowserRouter } from 'react-router-dom'
// import HomePage from '@components/payment/CardSimplePayment'
// import HomePage from '@components/payment/WalletPayment'
// import HomePage from '@components/payment/GeneralCardPayment'
// import HomePage from '@components/payment/PaymentInfo'
import HomePage from '@pages/payment/BookingPaymentPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  // {path: "/wallet", element: <WalletPayment />},
])
