import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const isEditing = !!moduleId;
  const isCreatingTestModule = !isEditing && searchParams.get('asTest') === '1';
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState('1');
  const [xpReward, setXpReward] = useState('50');
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const sectionsResponse = await api.get<Section[]>(`/tracks/${trackId}/sections`);
        if (cancelled) return;
        const section = sectionsResponse.data.find((item) => String(item.id) === sectionId);
        setSectionTitle(section?.title ?? '');

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
          const nextOrder = section ? section.modules.reduce((max, m) => Math.max(max, m.orderIndex), 0) + 1 : 1;
          setOrderIndex(String(nextOrder));
          if (isCreatingTestModule) {
            setTitle(t('moduleForm.testModuleDefaultTitle'));
          }
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
  }, [trackId, sectionId, moduleId, isEditing, isCreatingTestModule, t]);

  async function handleSave() {
    if (!title.trim()) {
      setError(t('moduleForm.errorTitleRequired'));
      return;
    }

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
        navigate(`/tracks/${trackId}/sections/${sectionId}/modules`, { replace: true, state: { toast: 'saved' } });
      } else {
        await api.post(`/sections/${sectionId}/modules`, {
          title,
          orderIndex: Number(orderIndex),
          xpReward: Number(xpReward),
          content,
          isSkipTest: isCreatingTestModule,
        });

        if (isCreatingTestModule) {
          navigate(`/tracks/${trackId}/sections/${sectionId}`, { replace: true, state: { toast: 'saved' } });
        } else {
          navigate(`/tracks/${trackId}/sections/${sectionId}/modules`, { replace: true, state: { toast: 'saved' } });
        }
      }
    } catch {
      setError(t('moduleForm.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    if (isCreatingTestModule) {
      navigate(`/tracks/${trackId}/sections/${sectionId}`);
    } else {
      navigate(`/tracks/${trackId}/sections/${sectionId}/modules`);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t('moduleForm.loading')}</p>;
  }

  return (
    <div>
      {sectionTitle && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link to={`/tracks/${trackId}/sections/${sectionId}/modules`} className="flex items-center gap-1 hover:text-foreground">
            <ArrowLeft size={13} />
            {sectionTitle}
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{title || t('moduleForm.titleNew')}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-2xl font-bold">
          {isCreatingTestModule
            ? t('moduleForm.titleNewTestModule')
            : isEditing
              ? t('moduleForm.titleEdit')
              : t('moduleForm.titleNew')}
        </h1>
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