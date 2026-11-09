import React from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label: React.ReactNode;
  value?: React.ReactNode;
  children: React.ReactNode;
  help?: React.ReactNode;
}

export default function Field({ label, value, children, help }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {label}
        {value !== undefined && <span className={styles.value}>{value}</span>}
      </span>
      {children}
      {help && <span className={styles.help}>{help}</span>}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: string;
  mono?: boolean;
}

export function FieldInput({ suffix, mono, className, ...props }: InputProps) {
  const inputClass = `${styles.input} ${mono ? styles.mono : ''} ${className ?? ''}`;
  if (!suffix) return <input {...props} className={inputClass} />;

  return (
    <span className={styles.suffixBox}>
      <input {...props} className={`${inputClass} ${styles.bare}`} />
      <span className={styles.suffix}>{suffix}</span>
    </span>
  );
}
