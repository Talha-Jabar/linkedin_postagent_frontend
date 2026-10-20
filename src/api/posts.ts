import { API_BASE_URL, request, requestBlob } from "./client";
import type {
  GenerateRequest,
  Health,
  ImageRequest,
  Post,
  PostList,
  PostStats,
  PostStatus,
  PostUpdate,
  ProfileSummary,
} from "./types";

export interface ListParams {
  status?: PostStatus;
  pillar?: string;
  limit?: number;
  offset?: number;
}

function query(params: ListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

const json = (body: unknown): RequestInit => ({ body: JSON.stringify(body) });

/** Cache-busted so a regenerated image is never served stale. */
export const imageUrl = (post: Post): string =>
  `${API_BASE_URL}/posts/${post.id}/image?v=${encodeURIComponent(post.updated_at)}`;

export const api = {
  health: () => request<Health>("/health"),
  profile: () => request<ProfileSummary>("/profile"),
  stats: () => request<PostStats>("/posts/stats"),
  listPosts: (params: ListParams) => request<PostList>(`/posts${query(params)}`),
  getPost: (id: string) => request<Post>(`/posts/${id}`),
  generate: (body: GenerateRequest) => request<Post>("/posts/generate", { method: "POST", ...json(body) }),
  updatePost: (id: string, changes: PostUpdate) =>
    request<Post>(`/posts/${id}`, { method: "PATCH", ...json(changes) }),
  deletePost: (id: string) => request<void>(`/posts/${id}`, { method: "DELETE" }),
  renderImage: (id: string, body: ImageRequest) =>
    request<Post>(`/posts/${id}/image`, { method: "POST", ...json(body) }),
  removeImage: (id: string) => request<Post>(`/posts/${id}/image`, { method: "DELETE" }),
  buildContext: (id: string) => request<Post>(`/posts/${id}/context`, { method: "POST" }),
  imageBlob: (post: Post) => requestBlob(`/posts/${post.id}/image?v=${encodeURIComponent(post.updated_at)}`),
};
