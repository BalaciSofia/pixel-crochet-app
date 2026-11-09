import React from 'react';
import styles from './Logo.module.css';

const SQUARES = [
  '#F4B6CB', '#FFD8B5', '#FCEBA6',
  '#BFE6CF', '#F4B6CB', '#B9DDF3',
  '#D6C6F0', '#FFD8B5', '#BFE6CF',
];

interface Props {
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ showWordmark = true, className }: Props) {
  return (
    <span className={`${styles.logo} ${className ?? ''}`}>
      <span className={styles.mark} aria-hidden="true">
        {SQUARES.map((color, i) => (
          <span key={i} className={styles.square} style={{ background: color }} />
        ))}
      </span>
      {showWordmark && <span className={styles.wordmark}>Pixel Pattern Studio</span>}
    </span>
  );
}
