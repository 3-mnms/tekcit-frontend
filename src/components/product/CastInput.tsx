// src/components/product/CastInput.tsx

import React, { useState } from 'react';
import Button from '@/components/common/Button';
import styles from './CastInput.module.css';

interface CastInputProps {
    casts: string[];
    onAddCast: (cast: string) => void;
    onRemoveCast: (cast: string) => void;
}

const CastInput: React.FC<CastInputProps> = ({ casts, onAddCast, onRemoveCast }) => {
    const [castInput, setCastInput] = useState<string>('');

    const handleCastInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCastInput(e.target.value);
    };

    const handleAddCast = () => {
        if (castInput.trim() !== '') {
            onAddCast(castInput.trim());
            setCastInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCast();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.castInputContainer}>
                <input
                    type="text"
                    className={styles.castInput}
                    value={castInput}
                    onChange={handleCastInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="출연진 이름을 입력하고 Enter를 누르세요."
                />
                <Button onClick={handleAddCast}>추가</Button>
            </div>
            <div className={styles.castTagsContainer}>
                {casts.map((castMember, index) => (
                    <div key={index} className={styles.castTag}>
                        <span>{castMember}</span>
                        <button 
                            type="button" 
                            className={styles.removeCastButton} 
                            onClick={() => onRemoveCast(castMember)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CastInput;