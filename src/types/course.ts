export type ThumbnailColor = "mustard" | "sage" | "forest";

export type LessonStatus = "completed" | "current" | "locked";

export interface Video {
  id: string;
  title: string;
  duration: string;
  price: number;
  status: LessonStatus;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  thumbnailColor: ThumbnailColor;
  price: number;
  videos: Video[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
}

export interface SubscriptionPlan {
  id: string;
  durationMonths: 1 | 3 | 6;
  price: number;
  label: string;
  description: string;
  popular?: boolean;
}
