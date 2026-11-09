'use client';

import React from 'react';
import Button from '@mui/material/Button';
import styles from './ToBuyList.module.css';
import Icon from '../Icon';
import useYarnStore from '../../../store/useYarnStore';

interface Props {
  colors: string[];
}

export default function ToBuyList({ colors }: Props) {
  const addYarn = useYarnStore(state => state.addYarn);

  if (colors.length === 0) return null;

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name="cart" size={10} strokeWidth={3} />
        </span>
        <span>
          <strong>
            {colors.length} {colors.length === 1 ? 'color' : 'colors'} to buy.
          </strong>{' '}
          Not in your yarn yet.
        </span>
      </div>
      <ul className={styles.list}>
        {colors.map(hex => (
          <li key={hex} className={styles.row}>
            <span className={styles.swatch} style={{ background: hex }} aria-hidden="true" />
            <span className={styles.hex}>{hex}</span>
            <Button
              size="tiny"
              onClick={() => addYarn(hex, '')}
              aria-label={`Already have ${hex}? Add it to my yarn`}
            >
              Have it? Add
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
