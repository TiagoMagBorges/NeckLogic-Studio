import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { Track } from '../../types/track';
import type { Section } from '../../types/section';

export default function TrackDetailPage() {
  const { trackId } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [track, setTrack] = useState<Track | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast === 'saved') {
      showToast(t('stage.moduleSaved'));
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, showToast, t]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [tracksResponse, sectionsResponse] = await Promise.all([
          api.get<Track[]>('/tracks/mine'),
          api.get<Section[]>(`/tracks/${trackId}/sections`),
        ]);

        if (cancelled) return;

        const foundTrack = tracksResponse.data.find((item) => String(item.id) === trackId);
        if (!foundTrack) {
          setError(t('trackDetail.notFound'));
          return;
        }

        setTrack(foundTrack);
        setSections(sectionsResponse.data);
      } catch {
        if (!cancelled) setError(t('trackDetail.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [trackId, t]);

  async function handleDelete() {
    if (!sectionToDelete) return;
    const section = sectionToDelete;
    setSectionToDelete(null);

    try {
      await api.delete(`/sections/${section.id}`);
      setSections((current) => current.filter((item) => item.id !== section.id));
    } catch {
      showToast(t('trackDetail.deleteError'), 'error');
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t('trackDetail.loading')}</p>;
  }

  if (error || !track) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft size={13} />
          {t('dashboard.title')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{track.title}</span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl font-bold">{track.title}</h1>
        <Link
          to={`/tracks/${trackId}/sections/new`}
          className="py-2 px-4 rounded-xl font-bold text-sm text-primary-foreground bg-primary"
        >
          {t('trackDetail.newSection')}
        </Link>
      </div>
      {track.description && <p className="text-muted-foreground mt-1 mb-6">{track.description}</p>}

      {sections.length === 0 && <p className="text-muted-foreground">{t('trackDetail.empty')}</p>}

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.id} className="bg-card border border-border/10 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="font-mono text-muted-foreground text-sm">#{section.orderIndex}</span>
                  <span>{section.title}</span>
                </div>
                {section.description && (
                  <p className="text-muted-foreground text-sm mt-1">{section.description}</p>
                )}
                <p className="text-muted-foreground text-xs mt-2">
                  {t('trackDetail.moduleCount', { count: section.modules.length })}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/tracks/${trackId}/sections/${section.id}/modules`}
                  className="text-sm border border-border/10 rounded-lg px-3 py-1.5"
                >
                  {t('trackDetail.modules')}
                </Link>
                <Link
                  to={`/tracks/${trackId}/sections/${section.id}/edit`}
                  className="text-sm border border-border/10 rounded-lg px-3 py-1.5"
                >
                  {t('trackDetail.edit')}
                </Link>
                <button
                  type="button"
                  onClick={() => setSectionToDelete(section)}
                  className="text-sm border border-destructive/40 text-destructive rounded-lg px-3 py-1.5"
                >
                  {t('trackDetail.delete')}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!sectionToDelete}
        title={t('trackDetail.deleteTitle')}
        message={sectionToDelete ? t('trackDetail.deleteConfirm', { title: sectionToDelete.title }) : ''}
        danger
        onConfirm={handleDelete}
        onCancel={() => setSectionToDelete(null)}
      />
      <Toast toast={toast} />
    </div>
  );
}