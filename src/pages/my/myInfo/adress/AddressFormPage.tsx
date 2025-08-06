import React from 'react';
import AddressForm from '@/components/my/myinfo/AddressForm';
import styles from './AddressFormPage.module.css';

const AddressFormPage: React.FC = () => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>배송지 추가</h2>
      <AddressForm />
    </section>
  );
};

export default AddressFormPage;
