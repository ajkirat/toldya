import { useEffect } from 'react';
import type { Toast as ToastType, Action } from '../types';

const ICONS: Record<ToastType['type'], string> = {
  fire:    '🔥',
  success: '✅',
  info:    'ℹ️',
};

interface Props {
  toast: ToastType;
  dispatch: (a: Action) => void;
}

export default function Toast({ toast, dispatch }: Props) {
  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 3500);
    return () => clearTimeout(t);
  }, [toast, dispatch]);

  return (
    <div className={`toast ${toast.type}`}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}
