import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ToastState } from '../hooks/useToast';

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;

  const isError = toast.variant === 'error';

  return (
    <div
      role="status"
      className={`toast-pop fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-card border rounded-xl px-4 py-3 shadow-2xl text-sm font-semibold ${
        isError ? 'border-destructive/40' : 'border-primary/35'
      }`}
    >
      {isError ? (
        <AlertCircle size={18} className="text-destructive shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="text-primary shrink-0" />
      )}
      {toast.message}
    </div>
  );
}
