import React, { useState } from 'react';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import styles from './PostcodeSearch.module.css';
import Button from '@components/common/Button';


interface DaumAddress {
    address: string;
    addressType: 'R' | 'J';
    bname: string;
    buildingName: string;
}

interface PostcodeSearchProps {
    onComplete: (address: string) => void;
}

const PostcodeSearch: React.FC<PostcodeSearchProps> = ({ onComplete }) => {
    const scriptUrl = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    const open = useDaumPostcodePopup(scriptUrl);
    const [address, setAddress] = useState('');

    const handleComplete = (data: DaumAddress) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setAddress(fullAddress);
        onComplete(fullAddress);
    };

    const handleClick = () => {
        open({ onComplete: handleComplete });
    };

    return (
        <div className={styles.postcodeSearchGroup}>
            <div className={styles.inputGroup}>
                <input
                    className={styles.input}
                    type="text"
                    value={address}
                    readOnly
                    placeholder="주소를 검색해주세요"
                />
                <Button variant="secondary" onClick={handleClick} className="whitespace-nowrap"> 주소 검색</Button>
            </div>
        </div>
    );
};

export default PostcodeSearch;