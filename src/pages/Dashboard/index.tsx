import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { Track } from '../../types/track';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function fetchTracks() {
      try {
        const response = await api.get<Track[]>('/tracks/mine');
        if (!cancelled) setTracks(response.data);
      } catch {
        if (!cancelled) setError(t('dashboard.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchTracks();
    return () => {
      cancelled = true;
    };
  }, [t]);

  async function handleDelete() {
    if (!trackToDelete) return;
    const track = trackToDelete;
    setTrackToDelete(null);

    try {
      await api.delete(`/tracks/${track.id}`);
      setTracks((current) => current.filter((item) => item.id !== track.id));
    } catch {
      showToast(t('dashboard.deleteError'), 'error');
    }
  }

  const publishedCount = tracks.filter((track) => track.published).length;
  const draftCount = tracks.length - publishedCount;
  const officialCount = tracks.filter((track) => track.official).length;

  return (
    <div className="max-w-[1040px] mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl font-bold">{t('dashboard.title')}</h1>
        <Link
          to="/tracks/new"
          className="flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-primary-foreground bg-primary"
        >
          <Plus size={15} />
          {t('dashboard.newTrack')}
        </Link>
      </div>
      <p className="text-muted-foreground mt-1 mb-6">
        {user?.isAdmin ? t('dashboard.subtitleAdmin') : t('dashboard.subtitleTeacher')}
      </p>

      {isLoading && <p className="text-muted-foreground">{t('dashboard.loading')}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {!isLoading && !error && tracks.length === 0 && (
        <p className="text-muted-foreground">{t('dashboard.empty')}</p>
      )}

      {!isLoading && !error && tracks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border border-border/10 rounded-2xl p-4">
            <div className="font-mono text-xl font-bold">{tracks.length}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
              {t('dashboard.statTracks')}
            </div>
          </div>
          <div className="bg-card border border-border/10 rounded-2xl p-4">
            <div className="font-mono text-xl font-bold">{publishedCount}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
              {t('dashboard.statPublished')}
            </div>
          </div>
          <div className="bg-card border border-border/10 rounded-2xl p-4">
            <div className="font-mono text-xl font-bold">{draftCount}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
              {t('dashboard.statDrafts')}
            </div>
          </div>
          <div className="bg-card border border-border/10 rounded-2xl p-4">
            <div className="font-mono text-xl font-bold">{officialCount}</div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
              {t('dashboard.statOfficial')}
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {tracks.map((track) => (
          <div key={track.id} className="bg-card border border-border/10 rounded-2xl p-4 flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <Link to={`/tracks/${track.id}`} className="font-semibold hover:text-primary">
                {track.title}
              </Link>
              <div className="flex flex-wrap justify-end gap-1.5 shrink-0">
                {track.official && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {t('dashboard.official')}
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    track.published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {track.published ? t('dashboard.published') : t('dashboard.draft')}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    track.paid ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/20 text-primary'
                  }`}
                >
                  {track.paid ? t('dashboard.paid') : t('dashboard.free')}
                </span>
              </div>
            </div>

            {track.description && <p className="text-muted-foreground text-sm">{track.description}</p>}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Layers size={13} />
              {track.ownerName}
            </div>

            <div className="flex items-center gap-2 mt-auto pt-1.5">
              <Link
                to={`/tracks/${track.id}`}
                className="text-sm border border-border/10 rounded-lg px-3 py-1.5"
              >
                {t('dashboard.open')}
              </Link>
              <Link
                to={`/tracks/${track.id}/edit`}
                className="text-sm border border-border/10 rounded-lg px-3 py-1.5"
              >
                {t('dashboard.edit')}
              </Link>
              {!track.official && (
                <button
                  type="button"
                  onClick={() => setTrackToDelete(track)}
                  className="text-sm border border-destructive/40 text-destructive rounded-lg px-3 py-1.5 ml-auto"
                >
                  {t('dashboard.delete')}
                </button>
              )}
            </div>
          </div>
        ))}

        {!isLoading && !error && (
          <Link
            to="/tracks/new"
            className="flex flex-col items-center justify-center gap-1.5 text-center border border-dashed border-border/20 rounded-2xl p-4 min-h-[120px] text-muted-foreground hover:text-primary hover:border-primary/40"
          >
            <Plus size={20} />
            <span className="text-[13px] font-semibold">{t('dashboard.newTrack')}</span>
            <span className="text-[11px]">{t('dashboard.newTrackHint')}</span>
          </Link>
        )}
      </div>

      <ConfirmDialog
        open={!!trackToDelete}
        title={t('dashboard.deleteTitle')}
        message={trackToDelete ? t('dashboard.deleteConfirm', { title: trackToDelete.title }) : ''}
        danger
        onConfirm={handleDelete}
        onCancel={() => setTrackToDelete(null)}
      />
      <Toast toast={toast} />
    </div>
  );
}