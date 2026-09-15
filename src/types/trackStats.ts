export interface TrackRatingEntry {
  id: number;
  stars: number;
  comment: string | null;
  userName: string;
  createdAt: string;
}

export interface TrackStats {
  trackId: number;
  title: string;
  paid: boolean;
  priceCents: number | null;
  enrolledCount: number;
  completedCount: number;
  completionRate: number;
  averageRating: number | null;
  ratingCount: number;
  estimatedRevenueCents: number;
  ratings: TrackRatingEntry[];
}