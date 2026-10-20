import { CheckCircle2, FileText, Image as ImageIcon, Trash2 } from "lucide-react";

import type { PostStatus } from "../api/types";
import { pillarLabel } from "../lib/format";

const STATUS = {
  draft: { label: "Draft", className: "bg-warn-soft text-warn", Icon: FileText },
  posted: { label: "Posted", className: "bg-ok-soft text-ok", Icon: CheckCircle2 },
  discarded: { label: "Discarded", className: "bg-sunken text-ink-3", Icon: Trash2 },
} as const;

export function StatusBadge({ status }: { status: PostStatus }) {
  const { label, className, Icon } = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function PillarBadge({ pillar }: { pillar: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-text">
      {pillarLabel(pillar)}
    </span>
  );
}

export function FormatBadge({ hasImage }: { hasImage: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-2">
      {hasImage ? <ImageIcon className="size-3.5" aria-hidden /> : <FileText className="size-3.5" aria-hidden />}
      {hasImage ? "Image" : "Text only"}
    </span>
  );
}
