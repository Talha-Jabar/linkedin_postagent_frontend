import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, type ListParams } from "../api/posts";
import type { GenerateRequest, ImageRequest, Post, PostUpdate } from "../api/types";

export const keys = {
  health: ["health"] as const,
  profile: ["profile"] as const,
  stats: ["stats"] as const,
  posts: (params: ListParams) => ["posts", params] as const,
  post: (id: string) => ["post", id] as const,
};

export function useHealth() {
  return useQuery({ queryKey: keys.health, queryFn: api.health, refetchInterval: 30_000 });
}

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: api.profile, staleTime: 60_000 });
}

export function useStats() {
  return useQuery({ queryKey: keys.stats, queryFn: api.stats });
}

export function usePosts(params: ListParams) {
  return useQuery({
    queryKey: keys.posts(params),
    queryFn: () => api.listPosts(params),
    placeholderData: keepPreviousData,
  });
}

export function usePost(id: string | undefined | null) {
  return useQuery({
    queryKey: keys.post(id ?? "none"),
    queryFn: () => api.getPost(id as string),
    enabled: Boolean(id),
  });
}

/** After any change: store the fresh post and refresh lists and stats. */
function useRefresh() {
  const queryClient = useQueryClient();
  return (post?: Post) => {
    if (post) queryClient.setQueryData(keys.post(post.id), post);
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
    void queryClient.invalidateQueries({ queryKey: keys.stats });
  };
}

export function useGenerate() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (body: GenerateRequest) => api.generate(body), onSuccess: refresh });
}

export function useUpdatePost() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: PostUpdate }) => api.updatePost(id, changes),
    onSuccess: refresh,
  });
}

export function useRenderImage() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & ImageRequest) => api.renderImage(id, body),
    onSuccess: refresh,
  });
}

export function useBuildContext() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: string) => api.buildContext(id), onSuccess: refresh });
}

export function useRemoveImage() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: string) => api.removeImage(id), onSuccess: refresh });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api.deletePost(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: keys.post(id) });
      refresh();
    },
  });
}
