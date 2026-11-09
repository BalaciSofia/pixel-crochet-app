'use client';

import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;

  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={false}
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      slotProps={{
        paper: {
          className: `${styles.paper} ${destructive ? styles.destructive : ''}`,
        },
      }}
    >
      <div className={styles.body}>
        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>
        <p id="confirm-dialog-message" className={styles.message}>
          {message}
        </p>
      </div>
      <div className={styles.actions}>
        <Button variant="outlined" color="neutral" onClick={onCancel} autoFocus={destructive}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={destructive ? 'secondary' : 'primary'}
          onClick={onConfirm}
          autoFocus={!destructive}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
