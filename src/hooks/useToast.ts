import { useCallback, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'error';

export interface ToastState {
  message: string;
  variant: ToastVariant;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    window.clearTimeout(timerRef.current);
    setToast({ message, variant });
    timerRef.current = window.setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast, showToast };
}
