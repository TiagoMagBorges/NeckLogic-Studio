import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { Switch } from '../../components/Switch';
import type { Track } from '../../types/track';

export default function TrackFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currencyPrefix = i18n.language === 'pt-BR' ? 'R$' : '$';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
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
        navigate('/dashboard', { replace: true });
      } else {
        const response = await api.post<{ id: number }>('/tracks', {
          title,
          description,
          published,
          paid,
          priceCents,
        });
        navigate(`/tracks/${response.data.id}`, { replace: true });
      }
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
    <div className="max-w-[720px] mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft size={13} />
          {t('dashboard.title')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">
          {isEditing ? t('trackForm.titleEdit') : t('trackForm.titleNew')}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h1 className="font-serif text-2xl font-bold">
            {isEditing ? t('trackForm.titleEdit') : t('trackForm.titleNew')}
          </h1>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="py-2.5 px-5 rounded-xl font-medium border border-border/10 text-foreground"
            >
              {t('trackForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl font-bold text-primary-foreground bg-primary disabled:bg-primary/60"
            >
              {isSubmitting ? t('trackForm.saving') : t('trackForm.save')}
            </button>
          </div>
        </div>

        {error && <p className="text-destructive text-sm mb-4">{error}</p>}

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 items-start">
          <div className="flex flex-col gap-4 bg-card border border-border/10 rounded-2xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {t('trackForm.sectionDetails')}
            </h2>

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
                rows={6}
                className="w-full bg-input-background border border-border/10 rounded-xl px-4 py-3 text-foreground text-[15px] focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col bg-card border border-border/10 rounded-2xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
              {t('trackForm.sectionSettings')}
            </h2>

            <div className="flex items-center justify-between gap-3 py-3 border-b border-border/10">
              <div>
                <div className="text-sm font-semibold">{t('trackForm.fieldPublished')}</div>
                <div className="text-xs text-muted-foreground">{t('trackForm.fieldPublishedHint')}</div>
              </div>
              <Switch checked={published} onChange={setPublished} label={t('trackForm.fieldPublished')} />
            </div>

            <div className="flex items-center justify-between gap-3 py-3 border-b border-border/10">
              <div>
                <div className="text-sm font-semibold">{t('trackForm.fieldPaid')}</div>
                <div className="text-xs text-muted-foreground">{t('trackForm.fieldPaidHint')}</div>
              </div>
              <Switch checked={paid} onChange={setPaid} label={t('trackForm.fieldPaid')} />
            </div>

            {paid && (
              <div className="flex flex-col gap-2 pt-3">
                <label htmlFor="price" className="text-sm font-medium text-foreground ml-1">
                  {t('trackForm.fieldPrice')}
                </label>
                <div className="flex items-center bg-input-background border border-border/10 rounded-xl overflow-hidden focus-within:border-primary">
                  <span className="px-3 text-muted-foreground text-sm font-mono border-r border-border/10">
                    {currencyPrefix}
                  </span>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceReais}
                    onChange={(event) => setPriceReais(event.target.value)}
                    className="w-full bg-transparent px-3 py-3 text-foreground text-[15px] font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}