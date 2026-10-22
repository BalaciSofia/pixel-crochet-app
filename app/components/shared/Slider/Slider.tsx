'use client';

import React, { useCallback } from 'react';
import MuiSlider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
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
    (_event: Event, newValue: number | number[]) => {
      onChange(Array.isArray(newValue) ? newValue[0] : newValue);
    },
    [onChange]
  );

  const displayValue = valueFormatter ? valueFormatter(value) : value.toString();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {showValue && (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {displayValue}
          </Typography>
        )}
      </div>
      <MuiSlider
        size="small"
        aria-label={label}
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
