'use client';

import React, { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import styles from './MatchYarnDialog.module.css';
import AppDialog from '../../shared/AppDialog';
import useYarnStore from '../../../store/useYarnStore';
import { useYarnNames } from '../../../hooks/useYarnNames';
import { suggestYarnMatch } from '../../../utils/imageToPixel';

type Choice = 'pending' | 'accepted' | 'rejected';

interface Props {
  colors: string[];
  onClose: () => void;
  onApply: (replacements: Record<string, string>) => void;
}

export default function MatchYarnDialog({ colors, onClose, onApply }: Props) {
  const yarns = useYarnStore(state => state.yarns);
  const yarnNames = useYarnNames();
  const [choices, setChoices] = useState<Record<string, Choice>>({});

  const suggestions = useMemo(() => {
    const yarnColors = yarns.map(yarn => yarn.color);
    return colors.map(hex => ({ hex, match: suggestYarnMatch(hex, yarnColors) }));
  }, [colors, yarns]);

  const matched = suggestions.filter(s => s.match);
  const accepted = matched.filter(s => choices[s.hex] === 'accepted');

  const choose = (hex: string, choice: Choice) =>
    setChoices(prev => ({ ...prev, [hex]: prev[hex] === choice ? 'pending' : choice }));

  const acceptAll = () =>
    setChoices(prev => {
      const next = { ...prev };
      for (const s of matched) next[s.hex] = 'accepted';
      return next;
    });

  const apply = () => {
    const replacements: Record<string, string> = {};
    for (const s of accepted) if (s.match) replacements[s.hex] = s.match;
    onApply(replacements);
  };

  const yarnLabel = (hex: string) => yarnNames.get(hex) ?? hex;

  return (
    <AppDialog
      onClose={onClose}
      title="Match to my yarn"
      width={520}
      intro="Swap colors you'd have to buy for the closest yarn you own. Every stitch in that color changes. You can undo this."
      actions={
        <>
          {matched.length > 1 && (
            <Button onClick={acceptAll} className={styles.acceptAll}>
              Accept all
            </Button>
          )}
          <Button variant="outlined" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={apply} disabled={accepted.length === 0}>
            Apply{accepted.length > 0 ? ` (${accepted.length})` : ''}
          </Button>
        </>
      }
    >
      <ul className={styles.list}>
        {suggestions.map(({ hex, match }) => {
          const choice = choices[hex] ?? 'pending';
          return (
            <li
              key={hex}
              className={`${styles.row} ${choice === 'accepted' ? styles.accepted : ''} ${choice === 'rejected' ? styles.rejected : ''}`}
            >
              <span className={styles.color}>
                <span className={styles.swatch} style={{ background: hex }} aria-hidden="true" />
                <span className={styles.hex}>{hex}</span>
              </span>
              {match ? (
                <>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                  <span className={styles.color}>
                    <span className={styles.swatch} style={{ background: match }} aria-hidden="true" />
                    <span className={styles.yarn}>{yarnLabel(match)}</span>
                  </span>
                  <span className={styles.buttons}>
                    <Button
                      size="tiny"
                      variant={choice === 'rejected' ? 'contained' : 'outlined'}
                      color="neutral"
                      aria-pressed={choice === 'rejected'}
                      aria-label={`Reject ${yarnLabel(match)} for ${hex}`}
                      onClick={() => choose(hex, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="tiny"
                      variant={choice === 'accepted' ? 'contained' : 'outlined'}
                      aria-pressed={choice === 'accepted'}
                      aria-label={`Accept ${yarnLabel(match)} for ${hex}`}
                      onClick={() => choose(hex, 'accepted')}
                    >
                      Accept
                    </Button>
                  </span>
                </>
              ) : (
                <span className={styles.noMatch}>No close match — still to buy</span>
              )}
            </li>
          );
        })}
      </ul>
    </AppDialog>
  );
}
