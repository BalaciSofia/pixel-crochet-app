'use client';

import React, { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import styles from './YarnStashDialog.module.css';
import useYarnStore from '../../../store/useYarnStore';

interface Props {
  onClose: () => void;
}

export default function YarnStashDialog({ onClose }: Props) {
  const yarns = useYarnStore(state => state.yarns);
  const addYarn = useYarnStore(state => state.addYarn);
  const renameYarn = useYarnStore(state => state.renameYarn);
  const removeYarn = useYarnStore(state => state.removeYarn);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [color, setColor] = useState('#B24A74');
  const [name, setName] = useState('');
  const [duplicate, setDuplicate] = useState(false);

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const added = addYarn(color, name);
      setDuplicate(!added);
      if (added) setName('');
    },
    [addYarn, color, name]
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" fullScreen={fullScreen}>
      <DialogTitle>My yarn</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add the colors you own. Imported images can be matched to them.
        </Typography>

        <div className={styles.list}>
          {yarns.length === 0 && (
            <Typography variant="body2" color="text.disabled">
              No yarn added yet.
            </Typography>
          )}
          {yarns.map(yarn => (
            <div key={yarn.id} className={styles.row}>
              <span className={styles.swatch} style={{ background: yarn.color }} />
              <TextField
                size="small"
                fullWidth
                placeholder="Name (optional)"
                value={yarn.name}
                onChange={e => renameYarn(yarn.id, e.target.value)}
                slotProps={{ htmlInput: { 'aria-label': `Name for ${yarn.color}` } }}
              />
              <Typography variant="caption" className={styles.hex}>
                {yarn.color}
              </Typography>
              <IconButton
                size="small"
                color="secondary"
                aria-label={`Remove ${yarn.name || yarn.color}`}
                onClick={() => removeYarn(yarn.id)}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </div>

        <form className={styles.addRow} onSubmit={handleAdd}>
          <input
            type="color"
            className={styles.colorInput}
            value={color}
            onChange={e => {
              setColor(e.target.value);
              setDuplicate(false);
            }}
            aria-label="Yarn color"
          />
          <TextField
            size="small"
            fullWidth
            placeholder="Name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            error={duplicate}
            helperText={duplicate ? 'You already have this color' : undefined}
            slotProps={{ htmlInput: { 'aria-label': 'New yarn name' } }}
          />
          <Button type="submit" variant="contained">
            Add
          </Button>
        </form>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
