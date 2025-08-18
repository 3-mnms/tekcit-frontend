import React, { useState } from 'react';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import styles from './PostcodeSearch.module.css';
import Button from '@components/common/Button';


// 삐약! Daum Postcode API의 Address 타입을 직접 정의합니다!
interface DaumAddress {
    address: string;
    addressType: 'R' | 'J';
    bname: string;
    buildingName: string;
    // 삐약! 필요한 다른 속성들이 있다면 여기에 추가할 수 있어요!
}

interface PostcodeSearchProps {
    onComplete: (address: string) => void;
}

const PostcodeSearch: React.FC<PostcodeSearchProps> = ({ onComplete }) => {
    const scriptUrl = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    const open = useDaumPostcodePopup(scriptUrl);
    const [address, setAddress] = useState('');

    // 삐약! data의 타입을 직접 정의한 DaumAddress로 지정했습니다!
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