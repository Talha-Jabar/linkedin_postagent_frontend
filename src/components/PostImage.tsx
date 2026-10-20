import { Copy, Download, ImageOff, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

import { ApiError } from "../api/client";
import { api, imageUrl } from "../api/posts";
import type { Post } from "../api/types";
import { useProfile, useRemoveImage, useRenderImage } from "../hooks/queries";
import { styleLabel } from "../lib/format";
import { ErrorAlert } from "./ErrorAlert";

/** Show, copy, download, regenerate, add or remove the post's image. */
export function PostImage({ post }: { post: Post }) {
  const profile = useProfile();
  const render = useRenderImage();
  const remove = useRemoveImage();
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const busy = render.isPending || remove.isPending;
  const src = imageUrl(post);
  const styles = profile.data?.image_styles ?? [];

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3000);
  }

  async function copyImage() {
    setActionError(null);
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": api.imageBlob(post) })]);
      flash("Image copied — paste it straight into the LinkedIn post editor.");
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error : new Error("The browser blocked copying images. Use Download instead."),
      );
    }
  }

  async function download() {
    setActionError(null);
    try {
      const blob = await api.imageBlob(post);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `linkedin-post-${post.created_at.slice(0, 10)}-${post.id.slice(0, 8)}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  function generate() {
    render.mutate(
      { id: post.id, prompt: prompt.trim() || undefined, style: style || undefined },
      {
        onSuccess: (updated) => {
          setEditing(false);
          setPrompt("");
          setStyle("");
          flash(
            `${post.has_image ? "New image" : "Image"} ready${
              updated.image_style ? ` — ${styleLabel(updated.image_style)}` : ""
            }.`,
          );
        },
      },
    );
  }

  function removeImage() {
    if (!window.confirm("Remove the image and make this a text-only post? You can add a new image later.")) return;
    remove.mutate(post.id);
  }

  return (
    <section className="card overflow-hidden" aria-label="Post image">
      <div className="relative aspect-square bg-sunken">
        {post.has_image && brokenSrc !== src ? (
          <img
            src={src}
            alt={post.image_prompt ?? "Post image"}
            className="size-full object-cover"
            onError={() => setBrokenSrc(src)}
          />
        ) : (
          <div className="grid size-full place-items-center p-6 text-center text-sm text-ink-3">
            <div className="space-y-2">
              <ImageOff className="mx-auto size-8" aria-hidden />
              <p>{post.has_image ? "The image file could not be loaded." : "Text-only post"}</p>
            </div>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-surface/80 p-4 text-center text-sm text-ink-2 backdrop-blur-sm">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {render.isPending ? "Designing and drawing the image… about 30–40 seconds" : "Removing…"}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        {post.has_image && post.image_style && (
          <p className="text-xs text-ink-3">
            Style: <span className="font-medium text-ink-2">{styleLabel(post.image_style)}</span>
          </p>
        )}
        {post.has_image ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary" onClick={copyImage} disabled={busy}>
              <Copy className="size-4" aria-hidden />
              Copy image
            </button>
            <button type="button" className="btn btn-secondary" onClick={download} disabled={busy}>
              <Download className="size-4" aria-hidden />
              Download
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing((v) => !v)}
              disabled={busy}
              aria-expanded={editing}
            >
              <RefreshCw className="size-4" aria-hidden />
              Regenerate
            </button>
            <button type="button" className="btn btn-danger" onClick={removeImage} disabled={busy}>
              <Trash2 className="size-4" aria-hidden />
              Remove
            </button>
          </div>
        ) : (
          !editing && (
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)} disabled={busy}>
              <ImagePlus className="size-4" aria-hidden />
              Add image
            </button>
          )
        )}

        {editing && (
          <div className="space-y-3 rounded-lg border border-line bg-sunken p-3">
            <div>
              <label className="label" htmlFor={`image-style-${post.id}`}>
                Style
              </label>
              <select
                id={`image-style-${post.id}`}
                className="field"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                disabled={busy}
              >
                <option value="">
                  {post.has_image ? "Automatic (a different style)" : "Automatic (suited to this post)"}
                </option>
                {styles.map((s) => (
                  <option key={s.key} value={s.key}>
                    {styleLabel(s.key)}
                  </option>
                ))}
              </select>
              {style && (
                <p className="mt-1 text-xs text-ink-3">{styles.find((s) => s.key === style)?.description}</p>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label className="label" htmlFor={`image-prompt-${post.id}`}>
                  Your description (optional)
                </label>
                {post.image_prompt && !prompt && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-text hover:underline"
                    onClick={() => setPrompt(post.image_prompt ?? "")}
                  >
                    Start from the current one
                  </button>
                )}
              </div>
              <textarea
                id={`image-prompt-${post.id}`}
                className="field min-h-24 resize-y field-sizing-content"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Leave empty for a fresh design by the AI art director, or describe exactly what you want."
                disabled={busy}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-primary" onClick={generate} disabled={busy}>
                {post.has_image ? "Generate new image" : "Generate image"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {notice && <p className="text-xs font-medium text-ok">{notice}</p>}
        <ErrorAlert
          error={render.error ?? remove.error ?? actionError}
          onDismiss={() => (render.reset(), remove.reset(), setActionError(null))}
        />
      </div>
    </section>
  );
}
