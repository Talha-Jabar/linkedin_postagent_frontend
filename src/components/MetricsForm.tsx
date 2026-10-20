import { useState, type FormEvent } from "react";

import type { Post, PostUpdate } from "../api/types";
import { useUpdatePost } from "../hooks/queries";
import { formatPercent } from "../lib/format";
import { ErrorAlert } from "./ErrorAlert";

const METRICS = [
  { key: "impressions", label: "Impressions" },
  { key: "reactions", label: "Reactions" },
  { key: "comments", label: "Comments" },
  { key: "reposts", label: "Reposts" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

const toText = (value: number | null) => (value == null ? "" : String(value));

/** Record LinkedIn performance for a post. Saving metrics also marks the post as posted. */
export function MetricsForm({ post }: { post: Post }) {
  const update = useUpdatePost();
  const [values, setValues] = useState<Record<MetricKey, string>>({
    impressions: toText(post.impressions),
    reactions: toText(post.reactions),
    comments: toText(post.comments),
    reposts: toText(post.reposts),
  });
  const [url, setUrl] = useState(post.linkedin_url ?? "");
  const [formError, setFormError] = useState<Error | null>(null);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const changes: PostUpdate = { linkedin_url: url.trim() || null };
    for (const { key, label } of METRICS) {
      const raw = values[key].trim();
      if (raw === "") {
        changes[key] = null;
        continue;
      }
      const number = Number(raw);
      if (!Number.isInteger(number) || number < 0) {
        setFormError(new Error(`${label} must be a whole number of 0 or more.`));
        return;
      }
      changes[key] = number;
    }
    if (post.status !== "posted") changes.status = "posted";
    update.mutate(
      { id: post.id, changes },
      {
        onSuccess: () => {
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  }

  return (
    <form className="card space-y-3 p-4 sm:p-5" onSubmit={submit} aria-label="LinkedIn performance">
      <div>
        <h2 className="font-semibold">LinkedIn performance</h2>
        <p className="text-xs text-ink-3">
          From your post on LinkedIn: impressions are under “View analytics”; reactions, comments and reposts are
          shown on the post. The app uses these to favor the post types that work.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {METRICS.map(({ key, label }) => (
          <div key={key}>
            <label className="label" htmlFor={`${key}-${post.id}`}>
              {label}
            </label>
            <input
              id={`${key}-${post.id}`}
              className="field tabular-nums"
              inputMode="numeric"
              value={values[key]}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="label" htmlFor={`url-${post.id}`}>
          LinkedIn post link
        </label>
        <input
          id={`url-${post.id}`}
          className="field"
          placeholder="https://www.linkedin.com/feed/update/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <ErrorAlert error={formError ?? update.error} onDismiss={() => (setFormError(null), update.reset())} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={update.isPending}>
          {post.status === "posted" ? "Save metrics" : "Save metrics & mark as posted"}
        </button>
        {saved && <span className="text-xs font-medium text-ok">Saved</span>}
        {post.engagement_rate != null && (
          <span className="text-xs text-ink-3">
            Engagement rate: <strong className="text-ink">{formatPercent(post.engagement_rate)}</strong>
          </span>
        )}
      </div>
    </form>
  );
}
