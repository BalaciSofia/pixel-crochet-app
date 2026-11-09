import React from 'react';
import styles from './BuyBadge.module.css';
import Icon from '../Icon';

interface Props {
  count?: number;
  className?: string;
}

export default function BuyBadge({ count, className }: Props) {
  if (count === undefined) {
    return (
      <span className={`${styles.square} ${className ?? ''}`} aria-hidden="true">
        <Icon name="cart" size={11} strokeWidth={3} />
      </span>
    );
  }

  return (
    <span className={`${styles.badge} ${className ?? ''}`}>
      <Icon name="cart" size={12} strokeWidth={2.4} />
      {count} to buy
    </span>
  );
}
