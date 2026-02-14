# gitsweep

**Git repository health check.**

One CLI to analyze any repo:
- 👥 **Authors** — detect duplicates, generate .mailmap
- 🚩 **Flags** — find stale feature flags  
- 🐷 **Bloat** — locate large files in history
- 🔐 **Security** — secret detection, CI integration
- 📊 **Visualize** — web UI for exploration

## Installation

```bash
npm install -g gitsweep
```

## Quick Start

```bash
# Full health check
gitsweep

# Specific checks
gitsweep authors      # Duplicate detection
gitsweep flags        # Stale feature flags
gitsweep bloat        # Large files

# CI mode
gitsweep ci --fail-on-secrets
```

## Commands

### `gitsweep` / `gitsweep analyze`

Run full repository analysis.

```bash
gitsweep                          # All checks
gitsweep --include authors,flags  # Specific modules
gitsweep --output json            # JSON output
```

### `gitsweep authors`

Detect duplicate Git identities and generate .mailmap files.

```bash
gitsweep authors                  # Text summary
gitsweep authors --output mailmap # Generate .mailmap
gitsweep authors --apply          # Write .mailmap file
gitsweep authors --threshold 80   # Higher match threshold
```

### `gitsweep flags`

Find stale feature flags (hardcoded to true/false).

```bash
gitsweep flags                 # Text summary
gitsweep flags --stale-only    # Only stale flags
gitsweep flags --diff          # Generate cleanup patches
gitsweep flags --output json   # JSON for CI
```

Detects patterns from:
- LaunchDarkly, Split.io, Unleash, Flipper
- Environment variables (`FEATURE_*`)
- Generic patterns (`isFeatureEnabled()`, etc.)

### `gitsweep bloat`

Find large files bloating your repository.

```bash
gitsweep bloat                    # Top 20 largest
gitsweep bloat --limit 50         # More files
gitsweep bloat --include-deleted  # Include deleted files
gitsweep bloat --min-size 5242880 # 5MB minimum
```

### `gitsweep visualize`

Launch web UI for interactive visualization.

```bash
gitsweep visualize             # Open in browser
gitsweep viz --port 8080       # Custom port
```

### `gitsweep ci`

CI/CD mode with JSON output and exit codes.

```bash
gitsweep ci                         # Run all checks
gitsweep ci --fail-on-secrets       # Exit 1 if secrets found
gitsweep ci --fail-on-stale-flags   # Exit 1 if stale flags
gitsweep ci --fail-on-bloat 10      # Exit 1 if files > 10MB
gitsweep ci --fail-on-duplicates    # Exit 1 if duplicate authors
```

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Author Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▸ Summary
Total identities: 653
Duplicate clusters: 71
Unique contributors: 551
Consolidation rate: 15.6%

▸ Duplicate Clusters

  Peter Steinberger <steipete@gmail.com> (7211 commits)
  └─ similar-name
     → Peter Steinberger <peter@steipete.me> (3 commits)
```

## Alias

Short alias `gsw` is also available:

```bash
gsw authors
gsw bloat
gsw ci
```

## License

MIT
