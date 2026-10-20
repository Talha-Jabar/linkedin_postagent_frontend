import { useSearchParams } from "react-router";

import type { PostStatus } from "../api/types";
import { ErrorAlert } from "../components/ErrorAlert";
import { PostListItem } from "../components/PostListItem";
import { Spinner } from "../components/Spinner";
import { usePosts, useProfile } from "../hooks/queries";
import { pillarLabel } from "../lib/format";

const PAGE_SIZE = 20;

const STATUS_TABS: { value: PostStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "posted", label: "Posted" },
  { value: "discarded", label: "Discarded" },
];

const isStatus = (value: string | null): value is PostStatus =>
  value === "draft" || value === "posted" || value === "discarded";

export function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const profile = useProfile();
  const statusParam = params.get("status");
  const status = isStatus(statusParam) ? statusParam : undefined;
  const pillar = params.get("pillar") || undefined;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const posts = usePosts({ status, pillar, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  const total = posts.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">History</h1>

      <div className="flex flex-wrap items-end gap-3">
        <div className="inline-flex rounded-lg border border-line bg-surface p-1" role="group" aria-label="Status">
          {STATUS_TABS.map((tab) => {
            const active = (status ?? "") === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                aria-pressed={active}
                onClick={() => setParam("status", tab.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="w-full sm:w-64">
          <label className="label" htmlFor="pillar-filter">
            Post type
          </label>
          <select
            id="pillar-filter"
            className="field"
            value={pillar ?? ""}
            onChange={(e) => setParam("pillar", e.target.value)}
          >
            <option value="">All types</option>
            {profile.data?.pillars.map((p) => (
              <option key={p.key} value={p.key}>
                {pillarLabel(p.key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="card p-2 sm:p-3">
        {posts.isPending && <Spinner className="p-3" />}
        <ErrorAlert error={posts.error} />
        {posts.data && posts.data.items.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-3">No posts match these filters.</p>
        )}
        {posts.data && posts.data.items.length > 0 && (
          <ul
            className={`divide-y divide-line transition-opacity ${posts.isPlaceholderData ? "opacity-60" : ""}`}
          >
            {posts.data.items.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </ul>
        )}
      </section>

      {total > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm text-ink-2">
          <span className="tabular-nums">
            {from}–{to} of {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setParam("page", String(page - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={page >= lastPage}
              onClick={() => setParam("page", String(page + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
