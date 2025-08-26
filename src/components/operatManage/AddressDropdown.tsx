import React from 'react';
import type { Address } from '@/models/admin/User';
import styles from './AddressDropdown.module.css';

interface AddressDropdownProps {
    addresses: Address[];
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({ addresses }) => {
    if (!addresses || addresses.length === 0) {
        return <span>주소 없음</span>;
    }

    // 삐약! is_primary가 true인 주소를 맨 위로 정렬합니다!
    const sortedAddresses = [...addresses].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return 0;
    });

    return (
        <select className={styles.dropdown}>
            {sortedAddresses.map((addr, index) => (
                <option key={index} value={addr.address}>
                    {addr.address}
                </option>
            ))}
        </select>
    );
};

export default AddressDropdown;