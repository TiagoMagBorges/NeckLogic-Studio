import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { Section, ModuleSummary } from '../../types/section';

export default function SectionModulesPage() {
  const { trackId, sectionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [section, setSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function handleDelete(module: ModuleSummary) {
    if (!confirm(t('sectionModules.deleteConfirm', { title: module.title }))) return;

    try {
      await api.delete(`/modules/${module.id}`);
      setSection((current) =>
        current ? { ...current, modules: current.modules.filter((item) => item.id !== module.id) } : current,
      );
    } catch {
      alert(t('sectionModules.deleteError'));
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
      <button
        type="button"
        onClick={() => navigate(`/tracks/${trackId}`)}
        className="text-sm text-muted-foreground mb-4"
      >
        {t('sectionModules.back')}
      </button>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">{section.title}</h1>
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

      <ul className="flex flex-col gap-3 mt-6">
        {section.modules.map((module) => (
          <li key={module.id} className="bg-card border border-border/10 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-muted-foreground text-sm">#{module.orderIndex}</span>
                <span>{module.title}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/tracks/${trackId}/sections/${sectionId}/modules/${module.id}/edit`}
                  className="text-sm border border-border/10 rounded-lg px-3 py-1.5"
                >
                  {t('sectionModules.edit')}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(module)}
                  className="text-sm border border-destructive/40 text-destructive rounded-lg px-3 py-1.5"
                >
                  {t('sectionModules.delete')}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}