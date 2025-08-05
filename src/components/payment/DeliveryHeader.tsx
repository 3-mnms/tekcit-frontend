import { useNavigate } from 'react-router-dom';
import styles from '@components/payment/DeliveryHeader.module.css';

const DeliveryHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['delivery-header']}>
      <div className={styles['delivery-header-top']}>
        <button className={styles['close-button']} onClick={() => navigate(-1)}>
          닫기
        </button>
        <h2 className={styles['delivery-title']}>배송지 관리</h2>
      </div>
      <p className={styles['delivery-description']}>
        배송지를 선택하시면 주문하실 상품의 배송지로 설정됩니다.
      </p>
    </div>
  );
};

export default DeliveryHeader;
