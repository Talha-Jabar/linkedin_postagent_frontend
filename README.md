# LinkedIn Post Generator — Frontend

React dashboard for the [LinkedIn Post Generator backend](https://github.com/Talha-Jabar/linkedin_postagent_backend):
generate posts with one click, review and edit them, copy the text and image into LinkedIn,
record each post's performance, and see which post types work best.

## Pages

| Page | What it does |
|---|---|
| **Generate** | Pick a post type (or automatic) and image mode, generate one post or a week of 7. Edit, copy the text, copy/download the image, open LinkedIn, mark as posted. The **Context** button next to "Copy post" opens a private briefing: the sources the post is based on, key points, replies for likely comments and further reading. |
| **History** | Every post with status and post-type filters, kept in the URL. |
| **Post details** | Everything above with the Context briefing open (handy while answering comments), plus: regenerate the image (fresh design, pick one of six visual styles, or write your own description), add/remove it, record impressions/reactions/comments/reposts, see the model, rewrite history and similarity to earlier posts. |
| **Insights** | Overall engagement, engagement rate by post type (chart + table), image vs text-only posts. |

Every backend error is shown as returned — including rule violations, the searches that were
tried, and the rejected draft — and nothing is retried silently.

## Setup

Requires Node.js 20.19+ and the backend running on `http://localhost:8000`.

```bash
cp .env.example .env     # only needed if the backend runs elsewhere
npm install
npm run dev              # http://localhost:5173 (the backend's CORS_ORIGINS must include it)
```

| Variable | Default | |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend URL. Every `VITE_*` value is public — never put secrets here. |
| `VITE_APP_NAME` | `LinkedIn Post Agent` | Header title |

## Scripts

```bash
npm run dev         # dev server with hot reload
npm run typecheck   # TypeScript, strict
npm run build       # typecheck + production build into dist/
```

## Stack

React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, React Router, lucide-react icons.
Light and dark mode follow the OS setting.

```
src/
  api/         fetch client (typed ApiError), endpoints, types mirroring the backend schemas
  hooks/       TanStack Query hooks (queries + mutations that refresh lists and stats)
  components/  editor, image panel, metrics form, details, badges, chart, error alert
  pages/       Generate, History, PostDetail, Insights
  lib/         formatting helpers
```
