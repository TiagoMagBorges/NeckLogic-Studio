import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { PendingApproval } from '../../types/pendingApproval';

export default function PendingApprovalsPage() {
  const { t } = useTranslation();
  const [pending, setPending] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function fetchPending() {
      try {
        const response = await api.get<PendingApproval[]>('/tracks/pending');
        if (!cancelled) setPending(response.data);
      } catch {
        if (!cancelled) setError(t('pendingApprovals.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPending();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function handleApprove(track: PendingApproval) {
    setApprovingId(track.id);
    try {
      await api.post(`/tracks/${track.id}/approve`);
      setPending((current) => current.filter((item) => item.id !== track.id));
      showToast(t('pendingApprovals.approved', { title: track.title }));
    } catch {
      showToast(t('pendingApprovals.approveError'), 'error');
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="max-w-[840px] mx-auto">
      <h1 className="font-serif text-2xl font-bold mb-1">{t('pendingApprovals.title')}</h1>
      <p className="text-muted-foreground mt-1 mb-6">{t('pendingApprovals.subtitle')}</p>

      {isLoading && <p className="text-muted-foreground">{t('pendingApprovals.loading')}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {!isLoading && !error && pending.length === 0 && (
        <p className="text-muted-foreground">{t('pendingApprovals.empty')}</p>
      )}

      <ul className="flex flex-col gap-3">
        {pending.map((track) => (
          <li key={track.id} className="bg-card border border-border/10 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">{track.title}</div>
              {track.description && <p className="text-muted-foreground text-sm mt-1">{track.description}</p>}
              <p className="text-muted-foreground text-xs mt-2">{t('pendingApprovals.owner', { name: track.ownerName })}</p>
            </div>
            <button
              type="button"
              onClick={() => handleApprove(track)}
              disabled={approvingId === track.id}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-primary-foreground bg-primary disabled:opacity-60 shrink-0"
            >
              <CheckCircle size={15} />
              {approvingId === track.id ? t('pendingApprovals.approving') : t('pendingApprovals.approve')}
            </button>
          </li>
        ))}
      </ul>

      <Toast toast={toast} />
    </div>
  );
}