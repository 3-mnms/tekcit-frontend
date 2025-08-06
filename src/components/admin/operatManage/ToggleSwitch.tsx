import React from 'react';
import styles from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
    isActive: boolean;
    onChange: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isActive, onChange }) => {
    return (
        <label className={styles.switch}>
            <input type="checkbox" checked={isActive} onChange={onChange} />
            <span className={styles.slider}>
                <span className={styles.onText}>활성화</span>
                <span className={styles.offText}>정지</span>
            </span>
        </label>
    );
};

export default ToggleSwitch;