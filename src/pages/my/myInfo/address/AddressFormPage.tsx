import React from 'react'
import AddressForm from '@/components/my/myinfo/address/AddressForm'
import styles from './AddressFormPage.module.css'

const AddressFormPage: React.FC = () => {
  return (
    <section className={styles.container}>
      <AddressForm />
    </section>
  )
}

export default AddressFormPage
