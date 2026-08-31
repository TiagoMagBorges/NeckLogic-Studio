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
        });
      } else {
        await api.post(`/tracks/${trackId}/sections`, {
          title,
          description,
          orderIndex: Number(orderIndex),
        });
      }

      navigate(`/tracks/${trackId}`, { replace: true });
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
    <div className="max-w-[520px]">
      <h1 className="text-2xl font-bold mb-6">
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
            className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
          />
        </div>

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