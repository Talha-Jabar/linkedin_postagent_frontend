import { BookOpen, Check, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";

import type { Post } from "../api/types";
import { useBuildContext } from "../hooks/queries";
import { formatDate, formatDateTime, hostname } from "../lib/format";
import { ErrorAlert } from "./ErrorAlert";

const BASIS_LABEL = {
  news: "News the post is based on",
  experience: "Your experience the post is based on",
  expertise: "Written from your expertise",
} as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{title}</h4>
      {children}
    </section>
  );
}

function LinkItem({ url, title, meta }: { url: string; title: string; meta?: string }) {
  return (
    <li>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-start gap-1.5 font-medium text-brand-text hover:underline"
      >
        <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {title}
      </a>
      <span className="ml-1 text-xs text-ink-3">
        · {hostname(url)}
        {meta && ` · ${meta}`}
      </span>
    </li>
  );
}

/** Private briefing: what the post is based on, key points, replies for likely comments, further reading. */
export function ContextPanel({ post }: { post: Post }) {
  const build = useBuildContext();
  const [copied, setCopied] = useState<number | null>(null);
  const [clipboardError, setClipboardError] = useState<Error | null>(null);
  const context = post.context;

  async function copyAnswer(index: number, answer: string) {
    setClipboardError(null);
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(index);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setClipboardError(new Error("The browser blocked clipboard access. Select the reply and copy it manually."));
    }
  }

  const buildButton = (label: string, primary: boolean) => (
    <button
      type="button"
      className={`btn ${primary ? "btn-primary" : "btn-secondary"}`}
      onClick={() => build.mutate(post.id)}
      disabled={build.isPending}
    >
      {build.isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : primary ? (
        <BookOpen className="size-4" aria-hidden />
      ) : (
        <RefreshCw className="size-4" aria-hidden />
      )}
      {build.isPending ? "Building… about 10 seconds" : label}
    </button>
  );

  return (
    <div
      id={`context-${post.id}`}
      className="space-y-5 rounded-lg border border-line bg-sunken p-4 text-sm"
      aria-label="Post context"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Context</h3>
          <p className="text-xs text-ink-3">
            Private briefing for you — the sources behind this post and replies for likely comments. Not part
            of the post.
          </p>
        </div>
        {context && buildButton("Rebuild", false)}
      </div>

      <ErrorAlert error={build.error ?? clipboardError} onDismiss={() => (build.reset(), setClipboardError(null))} />

      {!context ? (
        <div className="space-y-3">
          <p className="text-ink-2">This post has no context yet. Build it to see its references and talking points.</p>
          {buildButton("Build context", true)}
        </div>
      ) : (
        <>
          <Section title={BASIS_LABEL[context.basis.type]}>
            {context.basis.type === "news" && post.sources.length > 0 ? (
              <ul className="space-y-1.5">
                {post.sources.map((source) => (
                  <LinkItem
                    key={source.url}
                    url={source.url}
                    title={source.title}
                    meta={source.published_date ? formatDate(source.published_date) : undefined}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-ink-2">{context.basis.detail}</p>
            )}
          </Section>

          <Section title="Summary">
            <p className="leading-relaxed text-ink">{context.summary}</p>
          </Section>

          {context.key_points.length > 0 && (
            <Section title="Key points">
              <ul className="list-disc space-y-1 pl-5 text-ink-2">
                {context.key_points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </Section>
          )}

          {context.likely_questions.length > 0 && (
            <Section title="If people ask in the comments">
              <ul className="space-y-3">
                {context.likely_questions.map((qa, index) => (
                  <li key={qa.question} className="rounded-md border border-line bg-surface p-3">
                    <p className="font-semibold text-ink">{qa.question}</p>
                    <p className="mt-1 text-ink-2">{qa.answer}</p>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-text hover:underline"
                      onClick={() => copyAnswer(index, qa.answer)}
                    >
                      {copied === index ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : (
                        <Copy className="size-3.5" aria-hidden />
                      )}
                      {copied === index ? "Copied" : "Copy reply"}
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Further reading">
            {context.further_reading.length > 0 ? (
              <ul className="space-y-1.5">
                {context.further_reading.map((link) => (
                  <LinkItem key={link.url} url={link.url} title={link.title} />
                ))}
              </ul>
            ) : (
              <p className="text-ink-3">The web search found no further reading for this topic.</p>
            )}
          </Section>

          <p className="text-xs text-ink-3">
            Built {formatDateTime(context.generated_at)} with {context.model}. Replies only use the post, its
            sources and your experience — check the sources before quoting numbers.
          </p>
        </>
      )}
    </div>
  );
}
