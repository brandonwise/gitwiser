# Git Time Machine

**Understand any codebase in minutes.**

A beautiful, web-based tool to visualize Git repositories — from the 10,000ft view down to individual line changes.

---

## The Problem

Git's built-in tools are powerful but ugly. GitHub's insights are shallow. Gource is cool but not interactive. Understanding a codebase — especially one you didn't write — is still mostly guesswork.

**Questions that are hard to answer:**
- Who actually maintains this repo?
- Which parts of the code churn the most?
- When did this file get complicated?
- How has the team's contribution pattern changed?
- What's the "hot path" of development right now?

---

## The Solution

Paste a GitHub URL → get instant, beautiful insights at every level.

---

## Three Levels of Zoom

### 🔭 Repo Level — "The Big Picture"

**Activity Timeline**
- Commit density over time (GitHub-style contribution graph but better)
- Filter by author, file type, directory
- Spot bursts of activity, quiet periods, team changes

**Contributor Map**
- Who contributed what, when
- See knowledge silos (only one person touches auth?)
- Track contributor growth/churn over time

**File Tree Evolution**
- Animated tree showing repo growth
- Like Gource but interactive and web-based
- Scrub through time, click any point

**Hot Files**
- Which files change most frequently?
- Sorted by churn — high churn = attention needed
- Filter by time period (last month, last year, all time)

**Commit Patterns**
- When does the team commit? (day of week, time of day)
- Who commits when? (night owls vs early birds)
- Spot crunch times and sustainable periods

---

### 📁 Directory Level — "The Neighborhood"

**Directory Heat Map**
- Treemap visualization of code ownership
- Size = lines of code, color = change frequency
- Click to drill into subdirectories

**Ownership View**
- Who "owns" each directory? (by commit %)
- Bus factor: how many people know this area?
- Knowledge transfer opportunities

**Growth Chart**
- How has this directory grown?
- LOC over time, file count over time
- Identify bloat

---

### 📄 File Level — "The Details"

**Timeline View**
- Horizontal timeline with commits as dots
- Click any point to see the file at that moment
- Scrub through history like a video

**Heat Map**
- Which lines changed most frequently?
- Hot spots = high churn = potential problems
- Color intensity shows change frequency

**Author Colors**
- Each contributor gets a color
- See who wrote what at a glance
- Identify the expert for any section

**Diff Animation**
- Smooth transitions between versions
- Watch lines appear, change, disappear
- Makes evolution tangible

**Line Archaeology**
- Click any line → see its full history
- When was it written? By whom? Why?
- Follow renames and moves

---

## User Experience

### Entry Points

1. **Paste a URL** — `github.com/org/repo` → repo view
2. **Deep link** — `github.com/org/repo/blob/main/src/auth.js` → file view
3. **Search** — Find public repos by name
4. **Recent** — Quick access to repos you've viewed

### Navigation

- **Breadcrumbs**: Repo → Directory → File (always know where you are)
- **Keyboard shortcuts**: `j/k` to navigate, `Enter` to drill in, `Esc` to go up
- **Time scrubber**: Global control at bottom, affects all views
- **Filters**: By author, date range, file type (persist across views)

### Design Principles

1. **Dark mode first** — Easy on the eyes, looks professional
2. **Data density** — Show a lot without overwhelming
3. **Progressive disclosure** — Summary first, details on demand
4. **Instant feedback** — Loading states, smooth transitions
5. **Shareable** — Every view has a URL, great for team discussions

---

## Tech Stack

### Frontend
- **React + TypeScript** — Robust, good ecosystem
- **D3.js** — Custom visualizations (timeline, treemap, graphs)
- **Framer Motion** — Smooth animations
- **TailwindCSS** — Rapid styling, dark mode
- **Zustand** — Lightweight state management

### Backend
- **Go** — Fast, single binary, great for API
- **SQLite** — Cache git data locally
- **GitHub API** — Primary data source

### Infrastructure
- **Vercel** — Frontend hosting (free tier)
- **Fly.io** — API hosting (free tier for small workloads)
- **Cloudflare R2** — Cache storage if needed

---

## MVP Scope

### Phase 1: File-Level (Week 1)
- [ ] URL input → parse GitHub repo/file path
- [ ] Fetch commit history for file (GitHub API)
- [ ] Timeline visualization (horizontal, clickable)
- [ ] Show file content at selected commit
- [ ] Basic diff highlighting between versions
- [ ] Author colors
- [ ] Deploy to Vercel

### Phase 2: Repo-Level (Week 2)
- [ ] Repo overview dashboard
- [ ] Activity timeline (contribution graph)
- [ ] Hot files list (sorted by churn)
- [ ] Contributor breakdown
- [ ] Directory navigation

### Phase 3: Polish (Week 3)
- [ ] Animated file tree (Gource-style but interactive)
- [ ] Treemap for directory ownership
- [ ] Keyboard navigation
- [ ] Share links
- [ ] Performance optimization

### Future
- [ ] GitLab/Bitbucket support
- [ ] Private repos (OAuth)
- [ ] Team features (saved repos, annotations)
- [ ] Embeddable widgets
- [ ] CLI companion
- [ ] VS Code extension

---

## Competitive Landscape

| Feature | GitHub Insights | Gource | GitStats | Git Time Machine |
|---------|-----------------|--------|----------|------------------|
| Web-based | ✅ | ❌ | ❌ | ✅ |
| Beautiful | ❌ | ✅ | ❌ | ✅ |
| Interactive | ❌ | ❌ | ❌ | ✅ |
| File-level | ❌ | ❌ | ❌ | ✅ |
| Repo-level | Partial | ✅ | ✅ | ✅ |
| No install | ✅ | ❌ | ❌ | ✅ |
| Time travel | ❌ | ✅ | ❌ | ✅ |
| Shareable | Partial | ❌ | ❌ | ✅ |

---

## Monetization

### Free Tier
- Public repos
- All visualizations
- Last 1000 commits
- Standard rate limits

### Pro ($8/mo)
- Private repos (OAuth)
- Full history (no commit limit)
- Priority API
- Export visualizations (PNG, SVG)
- Team sharing

### Team ($20/mo per seat)
- Everything in Pro
- Saved repos & dashboards
- Annotations & comments
- API access
- Custom branding for embeds

---

## Name Candidates

- **Git Time Machine** — Clear, memorable
- **Rewind** — Short, evocative (rewind.dev)
- **Chronicle** — Storytelling angle
- **CodeScope** — Scientific feel
- **GitLens Web** — Familiar (but trademark issue?)
- **Archaeo** — Code archaeology

---

## Design Inspiration

- **Stripe Dashboard** — Data density done right
- **Linear** — Smooth animations, keyboard-first
- **Vercel Analytics** — Clean charts
- **Raycast** — Command palette, speed
- **Figma** — Collaborative feel

---

## Content/Marketing

**Launch sequence:**
1. Build in public on constantlythinking.com
2. Share progress on X with GIFs
3. Post to Hacker News when MVP is solid
4. Product Hunt launch
5. Write "Building Git Time Machine" series

**Blog post ideas:**
- "How I visualized React's 10-year history"
- "The most-edited file in the Linux kernel"
- "What git history reveals about team health"
- "Building a D3 timeline from scratch"

---

## Why This Will Work

1. **Clear pain** — Everyone's done git archaeology badly
2. **Wow factor** — Visuals make it shareable
3. **Viral loop** — Share links in PRs, docs, tweets
4. **Land and expand** — Free gets adoption, teams pay
5. **Build in public** — Content + product together

---

## Next Steps

1. Create GitHub repo (public from day 1)
2. Scaffold frontend (Vite + React + Tailwind)
3. Build GitHub API integration
4. Ship file-level MVP
5. Write first blog post
6. Iterate based on feedback
