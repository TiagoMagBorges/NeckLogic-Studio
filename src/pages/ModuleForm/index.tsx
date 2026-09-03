import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { ModuleDetail } from '../../types/module';
import type { Section } from '../../types/section';
import type { LessonStep } from '../../types/lessonStep';
import { ModuleStage } from './stage/ModuleStage';

function parseSteps(raw: string): LessonStep[] | null {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LessonStep[]) : null;
  } catch {
    return null;
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
  const [steps, setSteps] = useState<LessonStep[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

          const raw = response.data.content ?? '';
          const parsed = raw.trim() ? parseSteps(raw) : [];
          setSteps(parsed ?? []);
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

  async function handleSave() {
    setError(null);
    setIsSubmitting(true);

    const content = steps.length > 0 ? JSON.stringify(steps) : null;

    try {
      if (isEditing) {
        await api.put(`/modules/${moduleId}`, {
          title,
          orderIndex: Number(orderIndex),
          xpReward: Number(xpReward),
          content,
        });
      } else {
        await api.post(`/sections/${sectionId}/modules`, {
          title,
          orderIndex: Number(orderIndex),
          xpReward: Number(xpReward),
          content,
        });
      }

      navigate(`/tracks/${trackId}/sections/${sectionId}/modules`, { replace: true });
    } catch {
      setError(t('moduleForm.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate(`/tracks/${trackId}/sections/${sectionId}/modules`);
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t('moduleForm.loading')}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">{isEditing ? t('moduleForm.titleEdit') : t('moduleForm.titleNew')}</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="py-2.5 px-5 rounded-xl font-medium border border-border/10 text-foreground"
          >
            {t('moduleForm.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="py-2.5 px-5 rounded-xl font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
          >
            {isSubmitting ? t('moduleForm.saving') : t('moduleForm.save')}
          </button>
        </div>
      </div>

      {error && <p className="text-destructive text-sm mb-4">{error}</p>}

      <ModuleStage
        moduleTitle={title}
        onModuleTitleChange={setTitle}
        orderIndex={orderIndex}
        onOrderIndexChange={setOrderIndex}
        xpReward={xpReward}
        onXpRewardChange={setXpReward}
        steps={steps}
        onStepsChange={setSteps}
      />
    </div>
  );
}