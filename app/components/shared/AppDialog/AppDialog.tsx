'use client';

import React, { useId } from 'react';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import styles from './AppDialog.module.css';
import Icon from '../Icon';

interface Props {
  open?: boolean;
  onClose: () => void;
  title: string;
  width: number;
  children: React.ReactNode;
  actions: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  intro?: React.ReactNode;
}

export default function AppDialog({
  open = true,
  onClose,
  title,
  width,
  children,
  actions,
  onSubmit,
  intro,
}: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={false}
      aria-labelledby={titleId}
      slotProps={{
        paper: {
          className: styles.paper,
          style: fullScreen
            ? undefined
            : { width, maxWidth: 'calc(100% - 32px)', margin: 16, maxHeight: 'calc(100% - 32px)' },
          ...(onSubmit ? { component: 'form', onSubmit } : {}),
        },
      }}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <IconButton onClick={onClose} aria-label="Close" className={styles.close}>
          <Icon name="close" />
        </IconButton>
      </div>
      {intro && <p className={styles.intro}>{intro}</p>}
      <div className={styles.body}>{children}</div>
      <div className={styles.footer}>{actions}</div>
    </Dialog>
  );
}
