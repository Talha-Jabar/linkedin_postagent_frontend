import { ArrowLeft, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

import { FormatBadge, PillarBadge, StatusBadge } from "../components/Badges";
import { ErrorAlert } from "../components/ErrorAlert";
import { MetricsForm } from "../components/MetricsForm";
import { PostDetails } from "../components/PostDetails";
import { PostEditor } from "../components/PostEditor";
import { PostImage } from "../components/PostImage";
import { Spinner } from "../components/Spinner";
import { useDeletePost, usePost, useProfile } from "../hooks/queries";
import { formatDateTime } from "../lib/format";

export function PostDetailPage() {
  const { id } = useParams();
  const post = usePost(id);
  const profile = useProfile();
  const remove = useDeletePost();
  const navigate = useNavigate();

  function deletePost() {
    if (!post.data) return;
    if (!window.confirm("Delete this post and its image permanently? Discarding keeps it out of the way instead.")) {
      return;
    }
    remove.mutate(post.data.id, { onSuccess: () => navigate("/history") });
  }

  return (
    <div className="space-y-4">
      <Link to="/history" className="inline-flex items-center gap-1 text-sm text-brand-text hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        History
      </Link>

      {(post.isPending || profile.isPending) && <Spinner />}
      <ErrorAlert error={post.error ?? profile.error} />

      {post.data && profile.data && (
        <>
          <header className="space-y-2">
            <h1 className="text-xl font-semibold">{post.data.topic}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
              <StatusBadge status={post.data.status} />
              <PillarBadge pillar={post.data.pillar} />
              <FormatBadge hasImage={post.data.has_image} />
              <span>Generated {formatDateTime(post.data.created_at)}</span>
            </div>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0 space-y-4">
              <PostEditor key={post.data.id} post={post.data} profile={profile.data} />
              <MetricsForm key={post.data.id} post={post.data} />
            </div>
            <div className="space-y-4">
              <PostImage key={post.data.id} post={post.data} />
              <PostDetails post={post.data} />
              <div className="card space-y-2 p-4">
                <ErrorAlert error={remove.error} onDismiss={() => remove.reset()} />
                <button type="button" className="btn btn-danger w-full" onClick={deletePost} disabled={remove.isPending}>
                  <Trash2 className="size-4" aria-hidden />
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
