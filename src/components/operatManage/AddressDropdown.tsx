import React from 'react';
import type { Address } from '@/models/admin/User';
import styles from './AddressDropdown.module.css';

interface AddressDropdownProps {
    addresses: Address[];
}

const AddressDropdown: React.FC<AddressDropdownProps> = ({ addresses }) => {
    const validAddresses = addresses?.filter(addr => addr.address);

    if (!validAddresses || validAddresses.length === 0) {
        return <span>주소 없음</span>;
    }

    const sortedAddresses = [...addresses].sort((a, b) => {
        if (a.default && !b.default) {
            return -1;
        }
        if (!a.default && b.default) {
            return 1;
        }
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