import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddressItem from '@/components/my/myinfo/AddressItem';
import Button from '@/components/common/button/Button';
import styles from './AddressListPage.module.css';

const AddressListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>배송지 관리</h2>

      <div className={styles.card}>
        <AddressItem label="집" isDefault />
      </div>

      <Button
        className={styles.addButton}
        onClick={() => navigate('new')} 
      >
        + 새 배송지 추가
      </Button>
    </section>
  );
};

export default AddressListPage;