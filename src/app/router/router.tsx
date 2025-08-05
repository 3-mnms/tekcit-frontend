import { createBrowserRouter } from 'react-router-dom'
// import CardSimplePayment from '@components/payment/CardSimplePayment'
// import WalletPayment from '@components/payment/WalletPayment'
// import GeneralCardPayment from '@components/payment/GeneralCardPayment'
// import HomePage from '@components/payment/PaymentInfo'
import HomePage from '@pages/payment/BookingPaymentPage'
// import AddressForm from '@components/payment/AddressForm'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
])
