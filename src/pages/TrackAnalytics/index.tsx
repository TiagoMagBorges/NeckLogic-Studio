import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Star } from 'lucide-react';
import { api } from '../../services/api';
import type { TrackStats } from '../../types/trackStats';

export default function TrackAnalyticsPage() {
  const { trackId } = useParams();
  const { t, i18n } = useTranslation();
  const currencyPrefix = i18n.language === 'pt-BR' ? 'R$' : '$';

  const [stats, setStats] = useState<TrackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const response = await api.get<TrackStats>(`/tracks/${trackId}/stats`);
        if (!cancelled) setStats(response.data);
      } catch {
        if (!cancelled) setError(t('trackAnalytics.errorLoad'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [trackId, t]);

  if (isLoading) {
    return <p className="text-muted-foreground">{t('trackAnalytics.loading')}</p>;
  }

  if (error || !stats) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  const revenueValue = (stats.estimatedRevenueCents / 100).toLocaleString(i18n.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link to={`/tracks/${trackId}`} className="flex items-center gap-1 hover:text-foreground">
          <ArrowLeft size={13} />
          {t('trackAnalytics.backToTrack')}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{t('trackAnalytics.title')}</span>
      </div>

      <h1 className="font-serif text-2xl font-bold mb-1">{stats.title}</h1>
      <p className="text-muted-foreground mb-6">{t('trackAnalytics.title')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border/10 rounded-2xl p-4">
          <div className="font-mono text-xl font-bold">{stats.enrolledCount}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
            {t('trackAnalytics.statEnrolled')}
          </div>
        </div>
        <div className="bg-card border border-border/10 rounded-2xl p-4">
          <div className="font-mono text-xl font-bold">{stats.completedCount}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
            {t('trackAnalytics.statCompleted')}
          </div>
        </div>
        <div className="bg-card border border-border/10 rounded-2xl p-4">
          <div className="font-mono text-xl font-bold">{stats.completionRate.toFixed(0)}%</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
            {t('trackAnalytics.statCompletionRate')}
          </div>
        </div>
        <div className="bg-card border border-border/10 rounded-2xl p-4">
          <div className="font-mono text-xl font-bold flex items-center gap-1">
            {stats.averageRating != null ? stats.averageRating.toFixed(1) : '—'}
            <Star size={15} className="text-amber-400 fill-amber-400" />
          </div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
            {t('trackAnalytics.statAvgRating')}
          </div>
        </div>
        <div className="bg-card border border-border/10 rounded-2xl p-4">
          <div className="font-mono text-xl font-bold">{stats.ratingCount}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
            {t('trackAnalytics.statRatingCount')}
          </div>
        </div>
        {stats.paid && (
          <div className="bg-card border border-border/10 rounded-2xl p-4">
            <div className="font-mono text-xl font-bold">
              {currencyPrefix} {revenueValue}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mt-0.5">
              {t('trackAnalytics.statRevenue')}
            </div>
          </div>
        )}
      </div>

      {stats.paid && (
        <p className="text-muted-foreground text-xs mb-6">{t('trackAnalytics.revenueDisclaimer')}</p>
      )}

      <h2 className="font-serif text-lg font-bold mb-3">{t('trackAnalytics.ratingsTitle')}</h2>

      {stats.ratings.length === 0 ? (
        <p className="text-muted-foreground">{t('trackAnalytics.ratingsEmpty')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {stats.ratings.map((rating) => (
            <li key={rating.id} className="bg-card border border-border/10 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-sm">{rating.userName}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className={index < rating.stars ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                {rating.comment?.trim() ? rating.comment : t('trackAnalytics.noComment')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}