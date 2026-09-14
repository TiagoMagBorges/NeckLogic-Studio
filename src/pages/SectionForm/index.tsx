import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { Section } from '../../types/section';

export default function SectionFormPage() {
  const { trackId, sectionId } = useParams();
  const isEditing = !!sectionId;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState('1');

  const [skipRequiresTest, setSkipRequiresTest] = useState(false);
  const [skipTestModuleId, setSkipTestModuleId] = useState('');
  const [skipPassThreshold, setSkipPassThreshold] = useState('70');
  const [skipTestOptions, setSkipTestOptions] = useState<{ id: number; title: string }[]>([]);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchSections() {
      try {
        const response = await api.get<Section[]>(`/tracks/${trackId}/sections`);
        if (cancelled) return;

        if (isEditing) {
          const section = response.data.find((item) => String(item.id) === sectionId);
          if (!section) {
            setError(t('sectionForm.notFound'));
            return;
          }
          setTitle(section.title);
          setDescription(section.description ?? '');
          setOrderIndex(String(section.orderIndex));
          setSkipRequiresTest(section.skipRequiresTest);
          setSkipTestModuleId(section.skipTestModuleId ? String(section.skipTestModuleId) : '');
          setSkipPassThreshold(section.skipPassThreshold != null ? String(section.skipPassThreshold) : '70');
          setSkipTestOptions(section.modules.filter((module) => module.isSkipTest));
        } else {
          const nextOrder = response.data.reduce((max, item) => Math.max(max, item.orderIndex), 0) + 1;
          setOrderIndex(String(nextOrder));
        }
      } catch {
        if (!cancelled) setError(t('sectionForm.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSections();
    return () => {
      cancelled = true;
    };
  }, [trackId, sectionId, isEditing, t]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await api.put(`/sections/${sectionId}`, {
          title,
          description,
          orderIndex: Number(orderIndex),
          skipRequiresTest,
          skipTestModuleId: skipRequiresTest && skipTestModuleId ? Number(skipTestModuleId) : null,
          skipPassThreshold: skipRequiresTest ? Number(skipPassThreshold) : null,
        });
        navigate(`/tracks/${trackId}`, { replace: true });
      } else {
        const response = await api.post<{ id: number }>(`/tracks/${trackId}/sections`, {
          title,
          description,
          orderIndex: Number(orderIndex),
        });
        navigate(`/tracks/${trackId}/sections/${response.data.id}/modules`, { replace: true });
      }
    } catch {
      setError(t('sectionForm.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t('sectionForm.loading')}</p>;
  }

  return (
    <div className="max-w-[520px] mx-auto">
      <h1 className="font-serif text-2xl font-bold mb-6">
        {isEditing ? t('sectionForm.titleEdit') : t('sectionForm.titleNew')}
      </h1>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground ml-1">
            {t('sectionForm.fieldTitle')}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground ml-1">
            {t('sectionForm.fieldDescription')}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="orderIndex" className="text-sm font-medium text-foreground ml-1">
            {t('sectionForm.fieldOrder')}
          </label>
          <input
            id="orderIndex"
            type="number"
            min="1"
            value={orderIndex}
            onChange={(event) => setOrderIndex(event.target.value)}
            required
            className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] font-mono focus:outline-none focus:border-primary"
          />
        </div>

        {isEditing && (
          <div className="flex flex-col gap-3 border border-border/10 rounded-xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={skipRequiresTest}
                onChange={(event) => setSkipRequiresTest(event.target.checked)}
              />
              {t('sectionForm.skipRequiresTest')}
            </label>

            {skipRequiresTest && (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="skipTestModule" className="text-sm font-medium text-foreground ml-1">
                    {t('sectionForm.skipTestModule')}
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="skipTestModule"
                      value={skipTestModuleId}
                      onChange={(event) => setSkipTestModuleId(event.target.value)}
                      required
                      className="flex-1 bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
                    >
                      <option value="">{t('sectionForm.skipTestModulePlaceholder')}</option>
                      {skipTestOptions.map((module) => (
                        <option key={module.id} value={module.id}>{module.title}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => navigate(`/tracks/${trackId}/sections/${sectionId}/modules/new?asTest=1`)}
                      className="px-4 rounded-xl font-medium border border-border/10 text-foreground text-sm whitespace-nowrap"
                    >
                      {t('sectionForm.createTestModule')}
                    </button>
                  </div>
                  {skipTestOptions.length === 0 && (
                    <p className="text-muted-foreground text-xs ml-1">{t('sectionForm.skipTestModuleEmpty')}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="skipPassThreshold" className="text-sm font-medium text-foreground ml-1">
                    {t('sectionForm.skipPassThreshold')}
                  </label>
                  <input
                    id="skipPassThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={skipPassThreshold}
                    onChange={(event) => setSkipPassThreshold(event.target.value)}
                    required
                    className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-6 rounded-xl font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
          >
            {isSubmitting ? t('sectionForm.saving') : t('sectionForm.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tracks/${trackId}`)}
            className="py-3 px-6 rounded-xl font-medium border border-border/10 text-foreground"
          >
            {t('sectionForm.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}