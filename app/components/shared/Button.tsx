'use client';

import React from 'react';
import styles from './Button.module.css';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const Button = React.memo(function Button({
  children,
  onClick,
  type = 'button',
  variant = 'secondary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon,
  className = '',
}: Props) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
});

export default Button;
