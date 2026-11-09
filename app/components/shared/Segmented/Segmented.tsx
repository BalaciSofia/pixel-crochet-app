'use client';

import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import styles from './Segmented.module.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
  ariaLabel?: string;
}

interface Props<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  strong?: boolean;
  dense?: boolean;
  small?: boolean;
  className?: string;
}

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  strong = false,
  dense = false,
  small = false,
  className,
}: Props<T>) {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      aria-label={ariaLabel}
      onChange={(_event, next: T | null) => {
        if (next) onChange(next);
      }}
      className={`${styles.group} ${strong ? styles.strong : ''} ${className ?? ''}`}
    >
      {options.map(option => {
        const button = (
          <ToggleButton
            key={option.value}
            value={option.value}
            aria-label={option.ariaLabel}
            className={`${styles.item} ${dense ? styles.dense : ''} ${small ? styles.small : ''}`}
          >
            {option.icon}
            {option.label}
          </ToggleButton>
        );
        return option.tooltip ? (
          <Tooltip key={option.value} title={option.tooltip}>
            {button}
          </Tooltip>
        ) : (
          button
        );
      })}
    </ToggleButtonGroup>
  );
}
