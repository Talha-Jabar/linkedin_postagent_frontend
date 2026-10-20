import { AlertTriangle, X } from "lucide-react";

import { ApiError } from "../api/client";

const TITLES: Record<string, string> = {
  draft_rejected: "The draft kept breaking your content rules",
  no_fresh_sources: "No fresh news found for this post type",
  network_error: "Backend not reachable",
  external_service_error: "An external service failed",
  upstream_rate_limited: "Rate limit or quota reached",
  llm_response_error: "The AI response was unusable",
  database_unavailable: "Database not reachable",
  configuration_error: "Configuration problem",
  profile_error: "Profile file problem",
  conflict: "Already generating",
  invalid_request: "Request rejected",
  validation_error: "Invalid input",
  not_found: "Not found",
};

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

interface QueryTried {
  query: string;
  results: number;
  unused: number;
}

const asQueries = (value: unknown): QueryTried[] =>
  Array.isArray(value)
    ? value.filter((v): v is QueryTried => typeof v === "object" && v !== null && "query" in v)
    : [];

interface FieldError {
  loc: (string | number)[];
  msg: string;
}

const asFieldErrors = (value: unknown): FieldError[] =>
  Array.isArray(value)
    ? value.filter((v): v is FieldError => typeof v === "object" && v !== null && "msg" in v && "loc" in v)
    : [];

/** Renders any error - with the backend's violations, tried searches or field errors when present. */
export function ErrorAlert({ error, onDismiss }: { error: unknown; onDismiss?: () => void }) {
  if (!error) return null;
  const apiError = error instanceof ApiError ? error : null;
  const title = (apiError && TITLES[apiError.code]) ?? "Something went wrong";
  const message = error instanceof Error ? error.message : String(error);
  const details = apiError?.details ?? {};
  const violations = asStrings(details.violations).concat(asStrings(details.problems));
  const queries = asQueries(details.queries);
  const fieldErrors = asFieldErrors(details.errors);
  const lastDraft = details.last_draft as { content?: string } | undefined;
  const service = typeof details.service === "string" ? details.service : null;

  return (
    <div role="alert" className="rounded-lg border border-danger/40 bg-danger-soft p-4 text-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold text-ink">
            {title}
            {service && <span className="ml-2 font-normal text-ink-3">({service})</span>}
          </p>
          <p className="text-ink-2">{message}</p>
          {violations.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-ink-2">
              {violations.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          )}
          {fieldErrors.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-ink-2">
              {fieldErrors.map((e) => (
                <li key={`${e.loc.join(".")}-${e.msg}`}>
                  <code>{e.loc.filter((p) => p !== "body").join(".")}</code>: {e.msg}
                </li>
              ))}
            </ul>
          )}
          {queries.length > 0 && (
            <div className="text-ink-2">
              <p className="font-medium">Searches tried:</p>
              <ul className="list-disc pl-5">
                {queries.map((q) => (
                  <li key={q.query}>
                    “{q.query}” — {q.results} results, {q.unused} unused
                  </li>
                ))}
              </ul>
            </div>
          )}
          {lastDraft?.content && (
            <details className="text-ink-2">
              <summary className="cursor-pointer font-medium">See the rejected draft</summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md bg-surface p-3 font-sans text-xs">
                {lastDraft.content}
              </pre>
            </details>
          )}
        </div>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="text-ink-3 hover:text-ink" aria-label="Dismiss error">
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
