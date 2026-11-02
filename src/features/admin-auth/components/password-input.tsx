"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import styles from "./auth.module.css";

/** Password field with show/hide and a Caps Lock warning. */
export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  disabled,
  invalid,
  describedBy,
  autoFocus,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const checkCaps = (event: KeyboardEvent<HTMLInputElement>) =>
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);

  return (
    <>
      <div className={styles.passwordWrap}>
        <input
          id={id}
          className={styles.input}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyUp={checkCaps}
          onKeyDown={checkCaps}
          onBlur={() => setCapsLock(false)}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          autoFocus={autoFocus}
          placeholder={placeholder}
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.reveal}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
      {capsLock && (
        <p className={styles.caps} role="status">
          Caps Lock is on.
        </p>
      )}
    </>
  );
}
