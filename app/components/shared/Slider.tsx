'use client';

import React, { useCallback } from 'react';
import styles from './Slider.module.css';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
}

const Slider = React.memo(function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  showValue = true,
  valueFormatter,
}: Props) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const displayValue = valueFormatter ? valueFormatter(value) : value.toString();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>{label}</label>
        {showValue && <span className={styles.value}>{displayValue}</span>}
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
});

export default Slider;
