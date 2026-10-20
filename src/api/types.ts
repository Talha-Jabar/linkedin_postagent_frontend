// Mirrors the backend's Pydantic schemas (app/schemas/*.py).

export type PostStatus = "draft" | "posted" | "discarded";

export interface Source {
  title: string;
  url: string;
  published_date: string | null;
}

export interface AttemptLog {
  attempt: number;
  violations: string[];
  similarity: number | null;
  input_tokens: number;
  output_tokens: number;
}

export interface Post {
  id: string;
  created_at: string;
  updated_at: string;
  status: PostStatus;
  pillar: string;
  topic: string;
  angle: string;
  content: string;
  hashtags: string[];
  full_text: string;
  sources: Source[];
  search_query: string | null;
  experience_id: string | null;
  cta_goal: string | null;
  image_prompt: string | null;
  image_model: string | null;
  model: string;
  embedding_model: string;
  input_tokens: number;
  output_tokens: number;
  attempts: number;
  generation_log: AttemptLog[];
  max_similarity: number | null;
  most_similar_post_id: string | null;
  posted_at: string | null;
  linkedin_url: string | null;
  impressions: number | null;
  reactions: number | null;
  comments: number | null;
  reposts: number | null;
  char_count: number;
  has_image: boolean;
  engagement_rate: number | null;
}

export interface PostList {
  items: Post[];
  total: number;
  limit: number;
  offset: number;
}

export interface GenerateRequest {
  pillar?: string;
  with_image?: boolean;
}

export interface PostUpdate {
  content?: string;
  hashtags?: string[];
  status?: PostStatus;
  linkedin_url?: string | null;
  posted_at?: string | null;
  impressions?: number | null;
  reactions?: number | null;
  comments?: number | null;
  reposts?: number | null;
}

export interface PillarInfo {
  key: string;
  description: string;
  weight: number;
  uses_research: boolean;
  uses_experience: boolean;
}

export interface ProfileSummary {
  name: string;
  headline: string;
  pillars: PillarInfo[];
  hashtag_min: number;
  hashtag_max: number;
  post_max_chars: number;
  model: string;
}

export interface Health {
  status: string;
  database: string;
  profile: string;
  model: string;
}

export interface PillarStat {
  pillar: string;
  total: number;
  posted: number;
  avg_impressions: number | null;
  avg_reactions: number | null;
  avg_comments: number | null;
  avg_reposts: number | null;
  engagement_rate: number | null;
}

export interface FormatStat {
  format: "image" | "text_only";
  total: number;
  posted: number;
  avg_impressions: number | null;
  engagement_rate: number | null;
}

export interface PostStats {
  total: number;
  by_status: Record<PostStatus, number>;
  overall: { measured_posts: number; avg_impressions: number | null; engagement_rate: number | null };
  by_pillar: PillarStat[];
  by_format: FormatStat[];
}
