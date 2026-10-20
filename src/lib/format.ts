const ACRONYMS = new Set(["ai", "llm", "rag", "api", "ui", "ux"]);

/** agentic_ai_engineering -> "Agentic AI engineering" */
export function pillarLabel(key: string): string {
  return key
    .split("_")
    .map((word, i) => {
      if (ACRONYMS.has(word)) return word.toUpperCase();
      return i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join(" ");
}

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const dateOnly = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export const formatDateTime = (iso: string): string => dateTime.format(new Date(iso));
export const formatDate = (iso: string): string => dateOnly.format(new Date(iso));

export function formatPercent(value: number | null | undefined, digits = 1): string {
  return value == null ? "—" : `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat(undefined, {
    notation: Math.abs(value) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Exactly what gets pasted into LinkedIn (matches the backend's compose_full_text). */
export function composeFullText(content: string, hashtags: string[]): string {
  const body = content.trimEnd();
  return hashtags.length ? `${body}\n\n${hashtags.join(" ")}` : body;
}

export function parseHashtags(text: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of text.split(/[\s,]+/)) {
    if (!raw) continue;
    const tag = raw.startsWith("#") ? raw : `#${raw}`;
    if (seen.has(tag.toLowerCase())) continue;
    seen.add(tag.toLowerCase());
    tags.push(tag);
  }
  return tags;
}

export const firstLine = (text: string): string => text.trim().split("\n")[0] ?? "";
