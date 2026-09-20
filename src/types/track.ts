export interface Track {
  id: number;
  title: string;
  description: string | null;
  ownerName: string;
  official: boolean;
  published: boolean;
  approved: boolean;
  paid: boolean;
  priceCents: number | null;
  enrolledCount: number;
  completedCount: number;
  completionRate: number;
  averageRating: number | null;
  ratingCount: number;
  estimatedRevenueCents: number;
}