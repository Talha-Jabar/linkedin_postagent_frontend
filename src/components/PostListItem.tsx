import { FileText } from "lucide-react";
import { Link } from "react-router";

import { imageUrl } from "../api/posts";
import type { Post } from "../api/types";
import { firstLine, formatDateTime, formatPercent } from "../lib/format";
import { PillarBadge, StatusBadge } from "./Badges";

export function PostListItem({ post }: { post: Post }) {
  return (
    <li>
      <Link
        to={`/posts/${post.id}`}
        className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none"
      >
        <div className="size-16 shrink-0 overflow-hidden rounded-md border border-line bg-sunken">
          {post.has_image ? (
            <img src={imageUrl(post)} alt="" className="size-full object-cover" loading="lazy" />
          ) : (
            <div className="grid size-full place-items-center text-ink-3">
              <FileText className="size-5" aria-label="Text-only post" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{post.topic}</p>
          <p className="truncate text-sm text-ink-2">{firstLine(post.content)}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-3">
            <StatusBadge status={post.status} />
            <PillarBadge pillar={post.pillar} />
            <span>{formatDateTime(post.created_at)}</span>
            <span>· {post.char_count.toLocaleString()} chars</span>
            {post.engagement_rate != null && <span>· {formatPercent(post.engagement_rate)} engagement</span>}
          </div>
        </div>
      </Link>
    </li>
  );
}
