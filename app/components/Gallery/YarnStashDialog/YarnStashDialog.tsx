'use client';

import React, { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import styles from './YarnStashDialog.module.css';
import AppDialog from '../../shared/AppDialog';
import Icon from '../../shared/Icon';
import useYarnStore from '../../../store/useYarnStore';

interface Props {
  onClose: () => void;
}

export default function YarnStashDialog({ onClose }: Props) {
  const yarns = useYarnStore(state => state.yarns);
  const addYarn = useYarnStore(state => state.addYarn);
  const renameYarn = useYarnStore(state => state.renameYarn);
  const removeYarn = useYarnStore(state => state.removeYarn);

  const [color, setColor] = useState('#B24A74');
  const [name, setName] = useState('');
  const [duplicate, setDuplicate] = useState<string | null>(null);

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const added = addYarn(color, name);
      setDuplicate(added ? null : color.toUpperCase());
      if (added) setName('');
    },
    [addYarn, color, name]
  );

  return (
    <AppDialog
      onClose={onClose}
      title="My yarn"
      width={420}
      intro="The colors you own. New patterns start with them, and imports can match to them."
      actions={
        <Button variant="outlined" color="inherit" onClick={onClose} className={styles.done}>
          Done
        </Button>
      }
    >
      {yarns.length === 0 ? (
        <p className={styles.empty}>No yarn added yet.</p>
      ) : (
        <ul className={styles.list}>
          {yarns.map(yarn => (
            <li key={yarn.id} className={styles.row}>
              <span className={styles.swatch} style={{ background: yarn.color }} aria-hidden="true" />
              <input
                className={styles.nameInput}
                placeholder="Name (optional)"
                value={yarn.name}
                onChange={e => renameYarn(yarn.id, e.target.value)}
                aria-label={`Name for ${yarn.color}`}
              />
              <span className={styles.hex}>{yarn.color}</span>
              <IconButton
                aria-label={`Remove ${yarn.name || yarn.color}`}
                onClick={() => removeYarn(yarn.id)}
                className={styles.remove}
              >
                <Icon name="close" size={16} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.addBox} onSubmit={handleAdd}>
        <span className={styles.addTitle}>Add yarn</span>
        <div className={styles.addRow}>
          <label className={styles.colorPick} style={{ background: color }}>
            <span className={styles.visuallyHidden}>Yarn color</span>
            <input
              type="color"
              className={styles.colorInput}
              value={color}
              onChange={e => {
                setColor(e.target.value);
                setDuplicate(null);
              }}
            />
          </label>
          <input
            className={styles.newName}
            placeholder="Name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            aria-label="Name, optional"
          />
          <Button type="submit" variant="contained">
            Add
          </Button>
        </div>
        {duplicate && (
          <span role="alert" className={styles.error}>
            <Icon name="warning" size={14} strokeWidth={2.4} />
            {duplicate} is already in your yarn.
          </span>
        )}
      </form>
    </AppDialog>
  );
}
