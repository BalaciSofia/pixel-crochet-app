'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import styles from './YarnCalculator.module.css';
import Icon from '../../../shared/Icon';

interface Props {
  open: boolean;
  onOpen: () => void;
  value: string;
  onChange: (value: string) => void;
  autoFocus: boolean;
}

export default function YarnCalculator({ open, onOpen, value, onChange, autoFocus }: Props) {
  const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);

  return (
    <div className={styles.calc}>
      {open ? (
        <label className={styles.field}>
          <span>Yarn per stitch</span>
          <span className={styles.inputWrap}>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={value}
              onChange={e => onChange(e.target.value)}
              className={styles.input}
              autoFocus={autoFocus}
            />
            <span className={styles.suffix}>cm</span>
          </span>
        </label>
      ) : (
        <Button variant="outlined" color="neutral" size="compact" onClick={onOpen}>
          Calculate yarn needed
        </Button>
      )}

      <IconButton
        aria-label="How to measure yarn per stitch"
        onClick={e => setHelpAnchor(e.currentTarget)}
        className={styles.helpButton}
      >
        <Icon name="help" size={20} strokeWidth={1.9} />
      </IconButton>

      <Popover
        open={helpAnchor !== null}
        anchorEl={helpAnchor}
        onClose={() => setHelpAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: styles.helpPaper } }}
      >
        <h3 className={styles.helpTitle}>How to measure yarn per stitch</h3>
        <ol className={styles.helpSteps}>
          <li>
            Crochet a small test square, e.g. 10 × 10 stitches, with the same hook, yarn and tension as
            the pattern.
          </li>
          <li>Unravel it and measure the yarn you used, in cm.</li>
          <li>Divide by the number of stitches (100 for 10 × 10). That&apos;s your cm per stitch.</li>
        </ol>
        <p className={styles.helpTip}>
          Tip: if you carry the unused color inside your stitches (tapestry crochet), carry it in the test
          square too. A bigger test square gives a more accurate number.
        </p>
      </Popover>
    </div>
  );
}
