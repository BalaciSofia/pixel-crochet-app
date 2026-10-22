import { useCallback, useState } from 'react';
import type { ConfirmDialogProps } from './ConfirmDialog';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

const EMPTY_REQUEST: ConfirmRequest = { title: '', message: '', onConfirm: () => {} };

export function useConfirmDialog() {
  const [state, setState] = useState<{ open: boolean; request: ConfirmRequest }>({
    open: false,
    request: EMPTY_REQUEST,
  });

  const requestConfirm = useCallback((request: ConfirmRequest) => {
    setState({ open: true, request });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const confirm = useCallback(() => {
    state.request.onConfirm();
    close();
  }, [state.request, close]);

  const dialogProps: ConfirmDialogProps = {
    open: state.open,
    title: state.request.title,
    message: state.request.message,
    confirmLabel: state.request.confirmLabel,
    destructive: state.request.destructive,
    onConfirm: confirm,
    onCancel: close,
  };

  return { requestConfirm, dialogProps };
}
