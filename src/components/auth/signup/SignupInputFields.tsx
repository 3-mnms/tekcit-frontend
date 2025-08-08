import React, { useState } from "react";
import styles from "./SignupInputFields.module.css";
import Button from "@/components/common/button/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

interface SignupInputProps {
  icon: React.ReactNode;
  placeholder: string;
  hasButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SignupInputField: React.FC<SignupInputProps> = ({
  icon,
  placeholder,
  hasButton = false,
  buttonText,
  onButtonClick,
  type = "text",
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`${styles.row} ${hasButton ? styles.hasButtonRow : ""}`}>
      <div className={styles.inputWrapper}>
        <div className={styles.left}>
          {icon}
          <span className={styles.bar}>&nbsp;|</span>
        </div>

        <input
          type={inputType}
          placeholder={placeholder}
          className={styles.input}
          value={value}
          onChange={onChange}
        />

        {isPassword && (
          <div
            className={styles.eyeIcon}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FaEye className={styles.iconToggle} />
            ) : (
              <FaEyeSlash className={styles.iconToggle} />
            )}
          </div>
        )}
      </div>

      {hasButton && (
        <div className={styles.buttonWrapper}>
          <Button
            onClick={onButtonClick}
            className="w-[95px] h-[44px] text-sm"
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SignupInputField;