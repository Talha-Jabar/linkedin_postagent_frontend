import { BarChart, type BarDatum } from "../components/BarChart";
import { ErrorAlert } from "../components/ErrorAlert";
import { Spinner } from "../components/Spinner";
import { StatTile } from "../components/StatTile";
import { useStats } from "../hooks/queries";
import { formatNumber, formatPercent, pillarLabel } from "../lib/format";

const percentValue = (value: number) => formatPercent(value, 1);
// A 2.5% step needs one decimal (2.5%, 7.5%); a 2% step does not (2%, 4%).
const percentTick = (value: number, step: number) =>
  formatPercent(value, Number.isInteger(Math.round(step * 10_000) / 100) ? 0 : 1);

export function InsightsPage() {
  const stats = useStats();

  if (stats.isPending) return <Spinner />;
  if (stats.isError) return <ErrorAlert error={stats.error} />;

  const { overall, by_status: byStatus, by_pillar: byPillar, by_format: byFormat } = stats.data;
  const measured: BarDatum[] = byPillar
    .filter((p) => p.engagement_rate != null)
    .map((p) => ({
      key: p.pillar,
      label: pillarLabel(p.pillar),
      value: p.engagement_rate ?? 0,
      detail: `${p.posted} posted · avg ${formatNumber(p.avg_impressions)} impressions`,
    }))
    .sort((a, b) => b.value - a.value);
  const image = byFormat.find((f) => f.format === "image");
  const textOnly = byFormat.find((f) => f.format === "text_only");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Insights</h1>
        <p className="text-sm text-ink-2">
          Engagement rate = (reactions + comments + reposts) ÷ impressions, from the metrics you record on posted
          posts. Post types that perform better are picked more often (after 3 measured posts each).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Posts generated"
          value={formatNumber(stats.data.total)}
          sub={`${byStatus.posted} posted · ${byStatus.discarded} discarded`}
        />
        <StatTile label="Drafts waiting" value={formatNumber(byStatus.draft)} />
        <StatTile
          label="Engagement rate"
          value={formatPercent(overall.engagement_rate)}
          sub={`across ${overall.measured_posts} measured posts`}
        />
        <StatTile label="Avg impressions" value={formatNumber(overall.avg_impressions)} sub="per measured post" />
      </div>

      <section className="card p-4 sm:p-5" aria-labelledby="by-type-title">
        <h2 id="by-type-title" className="font-semibold">
          Engagement rate by post type
        </h2>
        <p className="mb-4 text-xs text-ink-3">Posted posts with impressions recorded</p>
        {measured.length > 0 ? (
          <BarChart
            data={measured}
            formatValue={percentValue}
            formatTick={percentTick}
            ariaLabel="Engagement rate by post type"
          />
        ) : (
          <p className="rounded-lg bg-sunken p-6 text-center text-sm text-ink-3">
            No performance data yet. After you publish a post, open it from History and enter its impressions,
            reactions, comments and reposts from LinkedIn.
          </p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Image versus text-only posts">
        <StatTile
          label="Posts with an image"
          value={formatPercent(image?.engagement_rate)}
          sub={`engagement · ${image?.posted ?? 0} posted of ${image?.total ?? 0}`}
        />
        <StatTile
          label="Text-only posts"
          value={formatPercent(textOnly?.engagement_rate)}
          sub={`engagement · ${textOnly?.posted ?? 0} posted of ${textOnly?.total ?? 0}`}
        />
      </section>

      <section className="card overflow-x-auto p-4 sm:p-5" aria-labelledby="table-title">
        <h2 id="table-title" className="mb-3 font-semibold">
          All post types
        </h2>
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-ink-3">
              <th className="py-2 pr-3 font-medium">Post type</th>
              <th className="py-2 pr-3 text-right font-medium">Generated</th>
              <th className="py-2 pr-3 text-right font-medium">Posted</th>
              <th className="py-2 pr-3 text-right font-medium">Avg impressions</th>
              <th className="py-2 pr-3 text-right font-medium">Avg reactions</th>
              <th className="py-2 pr-3 text-right font-medium">Avg comments</th>
              <th className="py-2 text-right font-medium">Engagement</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {byPillar.map((p) => (
              <tr key={p.pillar} className="border-b border-line last:border-0">
                <td className="py-2 pr-3 text-ink">{pillarLabel(p.pillar)}</td>
                <td className="py-2 pr-3 text-right">{p.total}</td>
                <td className="py-2 pr-3 text-right">{p.posted}</td>
                <td className="py-2 pr-3 text-right">{formatNumber(p.avg_impressions)}</td>
                <td className="py-2 pr-3 text-right">{formatNumber(p.avg_reactions)}</td>
                <td className="py-2 pr-3 text-right">{formatNumber(p.avg_comments)}</td>
                <td className="py-2 text-right">{formatPercent(p.engagement_rate)}</td>
              </tr>
            ))}
            {byPillar.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-ink-3">
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
