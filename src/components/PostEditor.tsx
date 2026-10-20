import { CheckCircle2, Copy, ExternalLink, RotateCcw, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { Post, PostUpdate, ProfileSummary } from "../api/types";
import { useUpdatePost } from "../hooks/queries";
import { composeFullText, parseHashtags } from "../lib/format";
import { ErrorAlert } from "./ErrorAlert";

const LINKEDIN_COMPOSE_URL = "https://www.linkedin.com/feed/?shareActive=true";

/** Edit the text and hashtags, copy the post, and move it between draft / posted / discarded.
 *  Render with key={post.id} so switching posts resets the local edits. */
export function PostEditor({ post, profile }: { post: Post; profile: ProfileSummary }) {
  const update = useUpdatePost();
  const [content, setContent] = useState(post.content);
  const [tagsText, setTagsText] = useState(post.hashtags.join(" "));
  const [copied, setCopied] = useState(false);
  const [clipboardError, setClipboardError] = useState<Error | null>(null);

  const hashtags = useMemo(() => parseHashtags(tagsText), [tagsText]);
  const fullText = composeFullText(content, hashtags);
  const dirty = content !== post.content || hashtags.join(" ") !== post.hashtags.join(" ");
  const overLimit = fullText.length > profile.post_max_chars;
  const tagsOutOfRange = hashtags.length < profile.hashtag_min || hashtags.length > profile.hashtag_max;

  function save(extra: PostUpdate = {}) {
    const changes: PostUpdate = dirty ? { ...extra, content, hashtags } : extra;
    update.mutate(
      { id: post.id, changes },
      {
        onSuccess: (saved) => {
          setContent(saved.content);
          setTagsText(saved.hashtags.join(" "));
        },
      },
    );
  }

  async function copyPost() {
    setClipboardError(null);
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setClipboardError(new Error("The browser blocked clipboard access. Select the text and copy it manually."));
    }
  }

  return (
    <section className="card space-y-4 p-4 sm:p-5" aria-label="Post text">
      <div>
        <label className="label" htmlFor={`content-${post.id}`}>
          Post text
        </label>
        <textarea
          id={`content-${post.id}`}
          className="field min-h-[16rem] resize-y leading-relaxed field-sizing-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor={`tags-${post.id}`}>
          Hashtags{" "}
          <span className={tagsOutOfRange ? "text-warn" : "font-normal text-ink-3"}>
            ({hashtags.length} · target {profile.hashtag_min}–{profile.hashtag_max})
          </span>
        </label>
        <textarea
          id={`tags-${post.id}`}
          className="field resize-none field-sizing-content"
          rows={1}
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={overLimit ? "font-semibold text-danger" : "text-ink-3"}>
          {fullText.length.toLocaleString()} / {profile.post_max_chars.toLocaleString()} characters
          {overLimit && " — too long for LinkedIn"}
        </span>
        {dirty && <span className="font-semibold text-warn">Unsaved changes</span>}
      </div>

      <ErrorAlert error={update.error ?? clipboardError} onDismiss={() => (update.reset(), setClipboardError(null))} />

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={copyPost}>
          <Copy className="size-4" aria-hidden />
          {copied ? "Copied!" : "Copy post"}
        </button>
        <a className="btn btn-secondary" href={LINKEDIN_COMPOSE_URL} target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" aria-hidden />
          Open LinkedIn
        </a>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!dirty || overLimit || update.isPending}
          onClick={() => save()}
        >
          <Save className="size-4" aria-hidden />
          Save edits
        </button>
        {post.status === "draft" ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={update.isPending || (dirty && overLimit)}
              onClick={() => save({ status: "posted" })}
            >
              <CheckCircle2 className="size-4" aria-hidden />
              Mark as posted
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={update.isPending}
              onClick={() => save({ status: "discarded" })}
            >
              <Trash2 className="size-4" aria-hidden />
              Discard
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            disabled={update.isPending}
            onClick={() => save({ status: "draft" })}
          >
            <RotateCcw className="size-4" aria-hidden />
            Back to draft
          </button>
        )}
      </div>
    </section>
  );
}
