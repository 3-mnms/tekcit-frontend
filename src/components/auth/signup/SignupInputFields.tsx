import React, { useState, forwardRef } from "react";
import styles from "./SignupInputFields.module.css";
import Button from "@/components/common/button/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

interface BaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  hasButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  error?: string;
}

const SignupInputField = forwardRef<HTMLInputElement, BaseProps>(
  (
    {
      icon,
      placeholder,
      hasButton = false,
      buttonText,
      onButtonClick,
      type = "text",
      error,
      ...inputProps // <-- register가 여기로 들어옴 (onChange, onBlur, name, ref 등)
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className={`${styles.row} ${hasButton ? styles.hasButtonRow : ""}`}>
        <div className={`${styles.inputWrapper} ${error ? styles.error : ""}`}>
          <div className={styles.left}>
            {icon}
            <span className={styles.bar}>&nbsp;|</span>
          </div>

          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            className={styles.input}
            {...inputProps}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FaEye className={styles.iconToggle} />
              ) : (
                <FaEyeSlash className={styles.iconToggle} />
              )}
            </button>
          )}
        </div>

        {hasButton && (
          <div className={styles.buttonWrapper}>
            <Button onClick={onButtonClick} className="w-[95px] h-[44px] text-sm">
              {buttonText}
            </Button>
          </div>
        )}

        {error && <p className={styles.errorText}>{error}</p>}
      </div>
    );
  }
);

export default SignupInputField;