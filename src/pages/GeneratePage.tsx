import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import type { GenerateRequest } from "../api/types";
import { FormatBadge, PillarBadge, StatusBadge } from "../components/Badges";
import { ErrorAlert } from "../components/ErrorAlert";
import { PostEditor } from "../components/PostEditor";
import { PostImage } from "../components/PostImage";
import { PostListItem } from "../components/PostListItem";
import { Spinner } from "../components/Spinner";
import { useGenerate, usePost, usePosts, useProfile } from "../hooks/queries";
import { formatDuration, pillarLabel } from "../lib/format";

type ImageMode = "auto" | "image" | "text";

const WEEK = 7;

interface Run {
  total: number;
  done: number;
  startedAt: number;
}

function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <span className="tabular-nums">{formatDuration((now - since) / 1000)}</span>;
}

export function GeneratePage() {
  const profile = useProfile();
  const generate = useGenerate();
  const drafts = usePosts({ status: "draft", limit: 12 });
  const [pillar, setPillar] = useState("");
  const [imageMode, setImageMode] = useState<ImageMode>("auto");
  const [latestId, setLatestId] = useState<string | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const stopRequested = useRef(false);
  const latest = usePost(latestId);

  const selectedPillar = profile.data?.pillars.find((p) => p.key === pillar);

  async function start(total: number) {
    setError(null);
    setSummary(null);
    stopRequested.current = false;
    setRun({ total, done: 0, startedAt: Date.now() });
    // A week uses automatic post types and the 3-in-4 image rotation for variety.
    const body: GenerateRequest =
      total === 1
        ? { pillar: pillar || undefined, with_image: imageMode === "auto" ? undefined : imageMode === "image" }
        : {};
    let done = 0;
    try {
      for (; done < total; done += 1) {
        if (stopRequested.current) break;
        const post = await generate.mutateAsync(body);
        setLatestId(post.id);
        setRun((current) => (current ? { ...current, done: done + 1 } : current));
      }
    } catch (err) {
      setError(err);
    } finally {
      setRun(null);
      if (total > 1) setSummary(`Generated ${done} of ${total} posts — they are in the drafts list below.`);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card p-4 sm:p-6">
        <h1 className="text-xl font-semibold">Generate a post</h1>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">
          Researches fresh news or one of your real experiences, writes in your voice, checks every content rule
          and makes sure it differs from earlier posts. Three of every four posts get a matching image.
        </p>

        <ErrorAlert error={profile.error} />

        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-72">
            <label className="label" htmlFor="pillar">
              Post type
            </label>
            <select
              id="pillar"
              className="field"
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              disabled={!!run}
            >
              <option value="">Automatic (recommended)</option>
              {profile.data?.pillars.map((p) => (
                <option key={p.key} value={p.key}>
                  {pillarLabel(p.key)}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-60">
            <label className="label" htmlFor="image-mode">
              Image
            </label>
            <select
              id="image-mode"
              className="field"
              value={imageMode}
              onChange={(e) => setImageMode(e.target.value as ImageMode)}
              disabled={!!run}
            >
              <option value="auto">Automatic (3 of every 4 posts)</option>
              <option value="image">With image</option>
              <option value="text">Text only</option>
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => start(1)}
            disabled={!!run || !profile.data}
          >
            <Sparkles className="size-4" aria-hidden />
            Generate post
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => start(WEEK)}
            disabled={!!run || !profile.data}
            title="Seven posts with automatic types and images"
          >
            <CalendarDays className="size-4" aria-hidden />
            Generate a week ({WEEK})
          </button>
        </div>

        {selectedPillar && (
          <p className="mt-2 text-xs text-ink-3">
            {selectedPillar.description}
            {selectedPillar.uses_research && " · Based on news from the last few days."}
            {selectedPillar.uses_experience && " · Based on one of your real experiences."}
          </p>
        )}

        {run && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-brand-soft p-4 text-sm">
            <Loader2 className="size-5 animate-spin text-brand-text" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {run.total === 1 ? "Writing your post" : `Writing post ${run.done + 1} of ${run.total}`} ·{" "}
                <Elapsed since={run.startedAt} />
              </p>
              <p className="text-ink-2">
                Research → writing → rule checks → image. About 15 seconds per post, plus ~20 seconds when it
                gets an image.
              </p>
            </div>
            {run.total > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  stopRequested.current = true;
                }}
              >
                Stop after this post
              </button>
            )}
          </div>
        )}

        {summary && <p className="mt-4 text-sm font-medium text-ok">{summary}</p>}
        <div className="mt-4">
          <ErrorAlert error={error} onDismiss={() => setError(null)} />
        </div>
      </section>

      {latest.data && profile.data && (
        <section className="space-y-3" aria-label="Latest post">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-2 text-lg font-semibold">Latest post</h2>
            <StatusBadge status={latest.data.status} />
            <PillarBadge pillar={latest.data.pillar} />
            <FormatBadge hasImage={latest.data.has_image} />
            <Link to={`/posts/${latest.data.id}`} className="ml-auto text-sm text-brand-text hover:underline">
              Details & metrics →
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <PostEditor key={latest.data.id} post={latest.data} profile={profile.data} />
            <PostImage key={latest.data.id} post={latest.data} />
          </div>
        </section>
      )}

      <section className="card p-4 sm:p-5" aria-label="Drafts">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            Drafts waiting to be posted{drafts.data ? ` (${drafts.data.total})` : ""}
          </h2>
          <Link to="/history?status=draft" className="text-sm text-brand-text hover:underline">
            All drafts →
          </Link>
        </div>
        {drafts.isPending && <Spinner />}
        <ErrorAlert error={drafts.error} />
        {drafts.data && drafts.data.items.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-3">No drafts yet. Generate your first post above.</p>
        )}
        {drafts.data && drafts.data.items.length > 0 && (
          <ul className="-mx-3 divide-y divide-line">
            {drafts.data.items.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
