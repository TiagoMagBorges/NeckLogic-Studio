import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Toast } from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import type { Section, ModuleSummary } from '../../types/section';

export default function SectionModulesPage() {
  const { trackId, sectionId } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<ModuleSummary | null>(null);
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

    async function fetchSection() {
      try {
        const response = await api.get<Section[]>(`/tracks/${trackId}/sections`);
        if (cancelled) return;

        const found = response.data.find((item) => String(item.id) === sectionId);
        if (!found) {
          setError(t('sectionModules.notFound'));
          return;
        }
        setSection(found);
      } catch {
        if (!cancelled) setError(t('sectionModules.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSection();
    return () => {
      cancelled = true;
    };
  }, [trackId, sectionId, t]);

  async function handleDelete() {
    if (!moduleToDelete) return;
    const module = moduleToDelete;
    setModuleToDelete(null);

    try {
      await api.delete(`/modules/${module.id}`);
      setSection((current) =>
        current ? { ...current, modules: current.modules.filter((item) => item.id !== module.id) } : current,
      );
    } catch {
      showToast(t('sectionModules.deleteError'), 'error');
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t('sectionModules.loading')}</p>;
  }

  if (error || !section) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to={`/tracks/${trackId}`} className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft size={13} />
          {t('sectionModules.back')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{section.title}</span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl font-bold">{section.title}</h1>
        <Link
          to={`/tracks/${trackId}/sections/${sectionId}/modules/new`}
          className="py-2 px-4 rounded-xl font-bold text-sm text-primary-foreground bg-primary"
        >
          {t('sectionModules.newModule')}
        </Link>
      </div>

      {section.modules.length === 0 && (
        <p className="text-muted-foreground mt-4">{t('sectionModules.empty')}</p>
      )}

      <ul className="grid sm:grid-cols-2 gap-3 mt-6">
        {section.modules.map((module) => (
          <li key={module.id} className="bg-card border border-border/10 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold min-w-0">
                <span className="font-mono text-muted-foreground text-sm shrink-0">#{module.orderIndex}</span>
                <span className="truncate">{module.title}</span>
              </div>
              {module.isSkipTest && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">
                  <GraduationCap size={11} />
                  {t('sectionModules.skipTest')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <Link
                to={`/tracks/${trackId}/sections/${sectionId}/modules/${module.id}/edit`}
                className="text-sm border border-border/10 rounded-lg px-3 py-1.5"
              >
                {t('sectionModules.edit')}
              </Link>
              <button
                type="button"
                onClick={() => setModuleToDelete(module)}
                className="text-sm border border-destructive/40 text-destructive rounded-lg px-3 py-1.5 ml-auto"
              >
                {t('sectionModules.delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!moduleToDelete}
        title={t('sectionModules.deleteTitle')}
        message={moduleToDelete ? t('sectionModules.deleteConfirm', { title: moduleToDelete.title }) : ''}
        danger
        onConfirm={handleDelete}
        onCancel={() => setModuleToDelete(null)}
      />
      <Toast toast={toast} />
    </div>
  );
}