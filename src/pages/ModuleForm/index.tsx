import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { ModuleDetail } from '../../types/module';
import type { Section } from '../../types/section';

function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export default function ModuleFormPage() {
  const { trackId, sectionId, moduleId } = useParams();
  const isEditing = !!moduleId;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState('1');
  const [xpReward, setXpReward] = useState('50');
  const [content, setContent] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        if (isEditing) {
          const response = await api.get<ModuleDetail>(`/modules/${moduleId}`);
          if (cancelled) return;
          setTitle(response.data.title);
          setOrderIndex(String(response.data.orderIndex));
          setXpReward(String(response.data.xpReward));
          setContent(response.data.content ? formatJson(response.data.content) : '');
        } else {
          const response = await api.get<Section[]>(`/tracks/${trackId}/sections`);
          if (cancelled) return;
          const section = response.data.find((item) => String(item.id) === sectionId);
          const nextOrder = section ? section.modules.reduce((max, m) => Math.max(max, m.orderIndex), 0) + 1 : 1;
          setOrderIndex(String(nextOrder));
        }
      } catch {
        if (!cancelled) setError(t('moduleForm.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [trackId, sectionId, moduleId, isEditing, t]);

  function handleFormatClick() {
    if (!content.trim()) return;

    try {
      setContent(JSON.stringify(JSON.parse(content), null, 2));
      setJsonError(null);
    } catch {
      setJsonError(t('moduleForm.errorInvalidJson'));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setJsonError(null);

    if (content.trim()) {
      try {
        JSON.parse(content);
      } catch {
        setJsonError(t('moduleForm.errorInvalidJson'));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await api.put(`/modules/${moduleId}`, {
          title,
          orderIndex: Number(orderIndex),
          xpReward: Number(xpReward),
          content: content.trim() || null,
        });
      } else {
        await api.post(`/sections/${sectionId}/modules`, {
          title,
          orderIndex: Number(orderIndex),
          xpReward: Number(xpReward),
          content: content.trim() || null,
        });
      }

      navigate(`/tracks/${trackId}/sections/${sectionId}/modules`, { replace: true });
    } catch {
      setError(t('moduleForm.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t('moduleForm.loading')}</p>;
  }

  return (
    <div className="max-w-[680px]">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? t('moduleForm.titleEdit') : t('moduleForm.titleNew')}
      </h1>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground ml-1">
            {t('moduleForm.fieldTitle')}
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

        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="orderIndex" className="text-sm font-medium text-foreground ml-1">
              {t('moduleForm.fieldOrder')}
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

          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="xpReward" className="text-sm font-medium text-foreground ml-1">
              {t('moduleForm.fieldXp')}
            </label>
            <input
              id="xpReward"
              type="number"
              min="0"
              value={xpReward}
              onChange={(event) => setXpReward(event.target.value)}
              required
              className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between ml-1">
            <label htmlFor="content" className="text-sm font-medium text-foreground">
              {t('moduleForm.fieldContent')}
            </label>
            <button
              type="button"
              onClick={handleFormatClick}
              className="text-xs text-primary font-medium"
            >
              {t('moduleForm.formatJson')}
            </button>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setJsonError(null);
            }}
            rows={16}
            placeholder={t('moduleForm.contentPlaceholder')}
            spellCheck={false}
            className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[13px] font-mono focus:outline-none focus:border-primary resize-y"
          />
          {jsonError && <p className="text-destructive text-xs ml-1">{jsonError}</p>}
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-6 rounded-xl font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
          >
            {isSubmitting ? t('moduleForm.saving') : t('moduleForm.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tracks/${trackId}/sections/${sectionId}/modules`)}
            className="py-3 px-6 rounded-xl font-medium border border-border/10 text-foreground"
          >
            {t('moduleForm.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}