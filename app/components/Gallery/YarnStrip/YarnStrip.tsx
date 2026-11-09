'use client';

import React from 'react';
import Button from '@mui/material/Button';
import styles from './YarnStrip.module.css';
import Icon from '../../shared/Icon';
import useYarnStore from '../../../store/useYarnStore';

interface Props {
  onOpen: () => void;
}

export default function YarnStrip({ onOpen }: Props) {
  const yarns = useYarnStore(state => state.yarns);
  const empty = yarns.length === 0;

  return (
    <section aria-labelledby="yarn-strip-title" className={styles.strip}>
      <div className={styles.heading}>
        <h2 id="yarn-strip-title" className={styles.title}>
          My yarn
        </h2>
        <span className={styles.count}>
          {empty
            ? 'No yarn yet — add the colors you own.'
            : `${yarns.length} ${yarns.length === 1 ? 'color' : 'colors'} in your stash`}
        </span>
      </div>

      {!empty && (
        <ul className={styles.list}>
          {yarns.map(yarn => (
            <li key={yarn.id} className={styles.yarn}>
              <span className={styles.swatch} style={{ background: yarn.color }} aria-hidden="true" />
              <span className={styles.text}>
                {yarn.name && <span className={styles.name}>{yarn.name}</span>}
                <span className={styles.hex}>{yarn.color}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          startIcon={<Icon name="plus" size={16} />}
          onClick={onOpen}
          className={styles.add}
        >
          Add yarn
        </Button>
        {!empty && (
          <Button size="small" onClick={onOpen}>
            Manage
          </Button>
        )}
      </div>
    </section>
  );
}
