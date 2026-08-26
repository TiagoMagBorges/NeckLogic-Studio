import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Track } from '../../types/track';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function handleDelete(track: Track) {
    if (!confirm(t('dashboard.deleteConfirm', { title: track.title }))) return;

    try {
      await api.delete(`/tracks/${track.id}`);
      setTracks((current) => current.filter((item) => item.id !== track.id));
    } catch {
      alert(t('dashboard.deleteError'));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <Link
          to="/tracks/new"
          className="py-2 px-4 rounded-xl font-bold text-sm text-primary-foreground bg-primary"
        >
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

      <ul className="flex flex-col gap-3">
        {tracks.map((track) => (
          <li key={track.id} className="bg-card border border-border/10 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-semibold">
                <span>{track.title}</span>
                {track.official && (
                  <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {t('dashboard.official')}
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    track.published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {track.published ? t('dashboard.published') : t('dashboard.draft')}
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                    track.paid ? 'bg-amber-500/20 text-amber-300' : 'bg-primary/20 text-primary'
                  }`}
                >
                  {track.paid ? t('dashboard.paid') : t('dashboard.free')}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/tracks/${track.id}/edit`}
                  className="text-sm border border-border/10 rounded-lg px-3 py-1.5"
                >
                  {t('dashboard.edit')}
                </Link>
                {!track.official && (
                  <button
                    type="button"
                    onClick={() => handleDelete(track)}
                    className="text-sm border border-destructive/40 text-destructive rounded-lg px-3 py-1.5"
                  >
                    {t('dashboard.delete')}
                  </button>
                )}
              </div>
            </div>
            {track.description && (
              <p className="text-muted-foreground text-sm mt-2">{track.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}