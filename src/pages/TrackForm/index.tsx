import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { Track } from '../../types/track';

export default function TrackFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(false);
  const [paid, setPaid] = useState(false);
  const [priceReais, setPriceReais] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;

    async function fetchTrack() {
      try {
        const response = await api.get<Track[]>('/tracks/mine');
        const track = response.data.find((item) => String(item.id) === id);

        if (!track) {
          if (!cancelled) setError(t('trackForm.notFound'));
          return;
        }

        if (cancelled) return;

        setTitle(track.title);
        setDescription(track.description ?? '');
        setPublished(track.published);
        setPaid(track.paid);
        setPriceReais(track.priceCents ? (track.priceCents / 100).toFixed(2) : '');
        setIsOfficial(track.official);
      } catch {
        if (!cancelled) setError(t('trackForm.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchTrack();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing, t]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const priceCents = paid && priceReais ? Math.round(Number(priceReais) * 100) : null;

    try {
      if (isEditing) {
        await api.put(`/tracks/${id}`, {
          title,
          description,
          published,
          paid,
          priceCents,
        });
      } else {
        await api.post('/tracks', {
          title,
          description,
          paid,
          priceCents,
        });
      }

      navigate('/dashboard', { replace: true });
    } catch {
      setError(t('trackForm.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground">{t('trackForm.loading')}</p>;
  }

  return (
    <div className="max-w-[520px] mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? t('trackForm.titleEdit') : t('trackForm.titleNew')}</h1>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground ml-1">
            {t('trackForm.fieldTitle')}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isOfficial}
            required
            className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground ml-1">
            {t('trackForm.fieldDescription')}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {isEditing && (
          <label className="flex items-center gap-2 text-sm text-foreground ml-1">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            {t('trackForm.fieldPublished')}
          </label>
        )}

        <label className="flex items-center gap-2 text-sm text-foreground ml-1">
          <input type="checkbox" checked={paid} onChange={(event) => setPaid(event.target.checked)} />
          {t('trackForm.fieldPaid')}
        </label>

        {paid && (
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-sm font-medium text-foreground ml-1">
              {t('trackForm.fieldPrice')}
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={priceReais}
              onChange={(event) => setPriceReais(event.target.value)}
              className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-6 rounded-xl font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
          >
            {isSubmitting ? t('trackForm.saving') : t('trackForm.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="py-3 px-6 rounded-xl font-medium border border-border/10 text-foreground"
          >
            {t('trackForm.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}