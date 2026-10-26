"use client";

import { useId } from "react";

import { Check } from "@/components/landing/icons";

import styles from "./form.module.css";

type Option = { value: string; label: string; hint?: string };

export function toOptions<T extends Record<string, string>>(
  labels: T,
): Option[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

type GroupBase = {
  id: string;
  className?: string;
  legend: string;
  hint?: string;
  required?: boolean;
  error?: string;
  options: Option[];
  variant?: "cards" | "chips";
  columns?: 2 | 3 | 4;
};

type SingleProps = GroupBase & {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiProps = GroupBase & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

/**
 * Accessible group of radio or checkbox inputs styled as cards or chips.
 * The native inputs stay in the DOM so keyboard and screen reader behaviour
 * is the browser's own.
 */
export function ChoiceGroup(props: SingleProps | MultiProps) {
  const {
    id,
    className,
    legend,
    hint,
    required,
    error,
    options,
    variant = "cards",
    columns = 3,
  } = props;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const type = props.multiple ? "checkbox" : "radio";

  const isChecked = (value: string) =>
    props.multiple ? props.value.includes(value) : props.value === value;

  const toggle = (value: string) => {
    if (props.multiple) {
      props.onChange(
        props.value.includes(value)
          ? props.value.filter((item) => item !== value)
          : [...props.value, value],
      );
    } else {
      props.onChange(value);
    }
  };

  return (
    <fieldset
      id={id}
      className={[styles.group, className].filter(Boolean).join(" ")}
      aria-describedby={
        [hintId, errorId].filter(Boolean).join(" ") || undefined
      }
      aria-invalid={error ? true : undefined}
      tabIndex={-1}
    >
      <legend className={styles.label}>
        {legend}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : (
          <span className={styles.optional}>(không bắt buộc)</span>
        )}
      </legend>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <div
        className={variant === "chips" ? styles.chips : styles.cards}
        data-columns={columns}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={variant === "chips" ? styles.chip : styles.card}
            data-checked={isChecked(option.value)}
          >
            <input
              type={type}
              name={id}
              value={option.value}
              checked={isChecked(option.value)}
              onChange={() => toggle(option.value)}
              required={required && !props.multiple}
            />
            <span className={styles.mark} aria-hidden="true">
              <Check />
            </span>
            <span className={styles.optionText}>
              <span>{option.label}</span>
              {option.hint && <small>{option.hint}</small>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "email" | "tel" | "numeric";
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  suffix?: string;
};

export function TextField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  required,
  multiline,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  maxLength,
  suffix,
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    value,
    required,
    placeholder,
    maxLength,
    autoComplete,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: styles.input,
  } as const;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : (
          <span className={styles.optional}>(không bắt buộc)</span>
        )}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={suffix ? styles.withSuffix : undefined}>
        {multiline ? (
          <textarea
            {...common}
            rows={3}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <input
            {...common}
            type={type}
            inputMode={inputMode}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Visually hidden field that real visitors leave empty (spam trap). */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
