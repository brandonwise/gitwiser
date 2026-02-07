# Git Time Machine

**Understand any codebase in minutes.**

A web-based tool to visualize Git repositories — from the big picture down to individual commits.

![Screenshot](https://via.placeholder.com/800x400?text=Screenshot+Coming+Soon)

## Features

### Activity Timeline
See commits over time. Spot patterns, bursts, and quiet periods. Click any week to drill into specific commits.

### Contributors
Who owns what. Contribution share, bus factor, and knowledge silos at a glance. Identify the experts for any part of the codebase.

### Hot Files (Coming Soon)
Find high-churn files. Where the action is — and where bugs hide.

### File Evolution (Coming Soon)
Scrub through a file's history like a video. Watch code transform between versions.

## Quick Start

```bash
cd app
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) and paste a GitHub URL.

## Tech Stack

- **React + TypeScript** — UI
- **D3.js** — Visualizations
- **Framer Motion** — Animations
- **Tailwind CSS v4** — Styling
- **Vite** — Build tool

## Status

This is a work in progress. Current state:

- [x] Landing page
- [x] Repo overview (stats, description)
- [x] Activity timeline with heatmap
- [x] Recent commits list
- [x] Contributors view with share chart
- [x] Team health metrics (bus factor)
- [ ] File-level analysis
- [ ] File evolution timeline
- [ ] Treemap visualization
- [ ] GitLab/Bitbucket support
- [ ] Private repos (OAuth)

## License

MIT
