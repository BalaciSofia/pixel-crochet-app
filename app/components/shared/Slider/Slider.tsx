'use client';

import React, { useCallback, useId } from 'react';
import MuiSlider from '@mui/material/Slider';
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
  help?: string;
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
  help,
}: Props) {
  const labelId = useId();
  const handleChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      onChange(Array.isArray(newValue) ? newValue[0] : newValue);
    },
    [onChange]
  );

  const displayValue = valueFormatter ? valueFormatter(value) : value.toString();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span id={labelId} className={styles.label}>
          {label}
        </span>
        {showValue && <span className={styles.value}>{displayValue}</span>}
      </div>
      <MuiSlider
        size="small"
        aria-labelledby={labelId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={styles.slider}
      />
      {help && <span className={styles.help}>{help}</span>}
    </div>
  );
});

export default Slider;
