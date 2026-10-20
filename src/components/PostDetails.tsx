import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import type { Post } from "../api/types";
import { formatDate, formatDateTime, formatPercent, pillarLabel, styleLabel } from "../lib/format";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-ink-3">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </>
  );
}

/** Everything that went into the post: sources, model, attempts, similarity, image prompt. */
export function PostDetails({ post }: { post: Post }) {
  const rewrites = post.generation_log.filter((a) => a.violations.length > 0);

  return (
    <section className="card space-y-4 p-4 text-sm sm:p-5" aria-label="Generation details">
      <div>
        <h3 className="label">Topic</h3>
        <p>{post.topic}</p>
      </div>
      <div>
        <h3 className="label">Angle</h3>
        <p className="text-ink-2">{post.angle}</p>
      </div>

      {post.sources.length > 0 && (
        <div>
          <h3 className="label">Sources</h3>
          <ul className="space-y-1.5">
            {post.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1 text-brand-text hover:underline"
                >
                  <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {source.title}
                </a>
                {source.published_date && (
                  <span className="ml-1 text-xs text-ink-3">· {formatDate(source.published_date)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <Row label="Post type">{pillarLabel(post.pillar)}</Row>
        <Row label="Generated">{formatDateTime(post.created_at)}</Row>
        {post.posted_at && <Row label="Posted">{formatDateTime(post.posted_at)}</Row>}
        <Row label="Writer model">{post.model}</Row>
        {post.image_model && <Row label="Image model">{post.image_model}</Row>}
        {post.image_style && <Row label="Image style">{styleLabel(post.image_style)}</Row>}
        <Row label="Attempts">
          {post.attempts} {post.attempts > 1 && <span className="text-ink-3">(rewritten to pass the rules)</span>}
        </Row>
        <Row label="Tokens">
          {post.input_tokens.toLocaleString()} in · {post.output_tokens.toLocaleString()} out
        </Row>
        <Row label="Closest earlier post">
          {post.max_similarity == null ? (
            "None yet"
          ) : (
            <>
              {formatPercent(post.max_similarity, 0)} similar
              {post.most_similar_post_id && (
                <>
                  {" · "}
                  <Link to={`/posts/${post.most_similar_post_id}`} className="text-brand-text hover:underline">
                    view
                  </Link>
                </>
              )}
            </>
          )}
        </Row>
        {post.search_query && <Row label="News search">“{post.search_query}”</Row>}
        {post.experience_id && <Row label="Experience used">{post.experience_id.replaceAll("_", " ")}</Row>}
        {post.cta_goal && <Row label="Call to action">{post.cta_goal.replaceAll("_", " ")}</Row>}
      </dl>

      {rewrites.length > 0 && (
        <details>
          <summary className="cursor-pointer font-medium text-ink-2">Why it was rewritten</summary>
          <ol className="mt-2 space-y-2">
            {rewrites.map((attempt) => (
              <li key={attempt.attempt}>
                <p className="text-xs font-semibold text-ink-3">Attempt {attempt.attempt}</p>
                <ul className="list-disc pl-5 text-ink-2">
                  {attempt.violations.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </details>
      )}

      {post.image_prompt && (
        <details>
          <summary className="cursor-pointer font-medium text-ink-2">Image description</summary>
          <p className="mt-2 text-ink-2">{post.image_prompt}</p>
        </details>
      )}
    </section>
  );
}
