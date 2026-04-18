# Benchmarks Page — Design Spec

**Date:** 2026-04-18
**Status:** Approved (pending user review of this spec)

## Goal

Add a new top-level page to jlsteenwyk.com that displays the HLE-Gold leaderboard, showing frontier model performance on the benchmark. The page is extensible to additional benchmarks in the future.

## Scope

In-scope:
- A new page `benchmarks.html` at the site root.
- A new nav link "Benchmarks" added to the shared header nav across all existing pages.
- A new JSON data file `benchmarks/hle_gold.json` containing the leaderboard data.
- Client-side rendering of a summary card, a horizontal bar chart (frontier view), and a full leaderboard table.
- New CSS appended to `assets/css/main.css` under a scoped `/* Benchmarks page */` section.

Out-of-scope (not this iteration):
- Multiple benchmarks. Only HLE-Gold ships now; the architecture leaves room to add more later.
- Interactive sorting/filtering of the table.
- Server-side rendering or build tooling. The site remains static.

## Nav integration

Add this `<li>` to the `<ul>` inside `#nav` on every page that currently has the header nav (index.html, publications.html, news.html, software.html, curriculum_vitae.html, arts.html, arts_visual.html, arts_music.html, arts_poetry.html, sciart.html, resources.html, contact.html, genomely.html):

```html
<li><a href="benchmarks.html" class="nav-link">Benchmarks</a></li>
```

**Placement:** between `Software` and `CV`. Sits naturally with research/tools content.

## Page structure

`benchmarks.html` reuses the existing page shell (same `<head>` metadata pattern, same header, footer, scripts). Content goes inside the standard `#content > #page-wrapper > #main.wrapper.style1 > .container` container used across the site.

Four stacked sections inside the container:

### 1. Page header
- `<h2>Benchmarks</h2>`
- Short intro paragraph (1–3 sentences). Draft:
  > Leaderboards tracking frontier model performance on evaluations relevant to biology, chemistry, and scientific reasoning.

### 2. HLE-Gold summary card
Pulled from top-level JSON fields. Displays:
- Title: "HLE-Gold"
- Total questions: `total_questions`
- Composition: `biology_medicine`, `chemistry`, `mcq`, `open_ended` — rendered as small labeled pills or a simple description list.

### 3. Frontier bar chart
Horizontal bar chart of all `leaderboard` entries, sorted by `accuracy` descending.

- **Axis:** 0–100% accuracy.
- **Bars:** pure CSS/HTML — `<div>` with width set to `accuracy%` of the container.
- **Colors:** biophilic moss/glacier gradient (`#4a6741` → `#3a6b80`). The top bar (frontier) highlighted with a deeper accent or a subtle `border`/`box-shadow`.
- **Labels:** each bar labeled with system `name` (left) and `accuracy%` (right).
- **Accessibility:** each bar has `role="img"` and `aria-label="<name>: <accuracy>% accuracy"`.

### 4. Full leaderboard table
Static, sorted by accuracy descending. Semantic HTML: `<table>` with `<thead>` / `<tbody>` / `<th scope="col">`.

| Column | Source | Notes |
|---|---|---|
| Rank | computed | 1-based, by sort order |
| Name | `name` | |
| Model | `model` | |
| System | `system` | |
| Score | `score` / `total` | rendered as `32 / 149` |
| Accuracy | `accuracy` | rendered as `21.5%` |
| Replicates | `replicates` | |
| Cost/Q (USD) | `cost_per_q_usd` | shows `—` when `null` |

## Data file

`benchmarks/hle_gold.json` — dropped in as provided. Expected shape:

```json
{
  "benchmark": "HLE-Gold",
  "total_questions": 149,
  "composition": {
    "biology_medicine": 107,
    "chemistry": 42,
    "mcq": 92,
    "open_ended": 57
  },
  "leaderboard": [
    {
      "name": "Direct GPT-5.4",
      "model": "gpt-5.4",
      "system": "direct",
      "score": 32,
      "total": 149,
      "accuracy": 21.5,
      "replicates": 1,
      "cost_per_q_usd": null
    }
  ]
}
```

## Rendering

Vanilla JavaScript inside `benchmarks.html`, inside a `DOMContentLoaded` listener:

1. `fetch('benchmarks/hle_gold.json')`.
2. On success:
   - Populate summary card from top-level fields.
   - Sort `leaderboard` by `accuracy` descending.
   - Render bar chart.
   - Render table rows.
3. On failure: render `Leaderboard data unavailable.` inside the summary card area.

No charting library. No framework. Zero new dependencies.

## Styling

New CSS appended to `assets/css/main.css` under a scoped section header:

```
/* ========================================
   Benchmarks page
   ======================================== */
```

Uses existing biophilic theme tokens (moss green, glacier blue, surface colors, shadows, radii). No changes to existing styles. Card/table styling follows the existing `.wrapper` patterns so the page inherits the site's look.

## Error handling and edge cases

- `fetch` failure: show an inline error in the summary card slot.
- `cost_per_q_usd === null`: render as `—`.
- Empty `leaderboard` array: render a "No entries yet" message in place of the chart and table.

## Acceptance criteria

- A user visiting `/benchmarks.html` sees the nav link highlighted as "Benchmarks," the HLE-Gold summary, a sorted frontier bar chart, and a complete leaderboard table.
- Every other page in the site has the new "Benchmarks" nav link in its header, placed between Software and CV.
- The page works under all existing themes (biophilic + others) since styles use shared tokens/wrappers.
- Updating the leaderboard is a one-file edit: drop a new `benchmarks/hle_gold.json`; no HTML changes required.
