# gitaudit

**Git repository health check.**

One CLI to analyze any repo:
- 👥 **Authors** — detect duplicates, generate .mailmap
- 🚩 **Flags** — find stale feature flags  
- 🐷 **Bloat** — locate large files in history
- 🔐 **Security** — secret detection, CI integration
- 📊 **Visualize** — web UI for exploration

## Installation

```bash
npm install -g gitaudit
```

## Quick Start

```bash
# Full health check
gitaudit

# Specific checks
gitaudit authors      # Duplicate detection
gitaudit flags        # Stale feature flags
gitaudit bloat        # Large files

# CI mode
gitaudit ci --fail-on-secrets
```

## Commands

### `gitaudit` / `gitaudit analyze`

Run full repository analysis.

```bash
gitaudit                       # All checks
gitaudit --include authors,flags  # Specific modules
gitaudit --output json         # JSON output
```

### `gitaudit authors`

Detect duplicate Git identities and generate .mailmap files.

```bash
gitaudit authors               # Text summary
gitaudit authors --output mailmap  # Generate .mailmap
gitaudit authors --apply       # Write .mailmap file
gitaudit authors --threshold 80    # Higher match threshold
```

### `gitaudit flags`

Find stale feature flags (hardcoded to true/false).

```bash
gitaudit flags                 # Text summary
gitaudit flags --stale-only    # Only stale flags
gitaudit flags --diff          # Generate cleanup patches
gitaudit flags --output json   # JSON for CI
```

Detects patterns from:
- LaunchDarkly, Split.io, Unleash, Flipper
- Environment variables (`FEATURE_*`)
- Generic patterns (`isFeatureEnabled()`, etc.)

### `gitaudit bloat`

Find large files bloating your repository.

```bash
gitaudit bloat                 # Top 20 largest
gitaudit bloat --limit 50      # More files
gitaudit bloat --include-deleted   # Include deleted files
gitaudit bloat --min-size 5242880  # 5MB minimum
```

### `gitaudit visualize`

Launch web UI for interactive visualization.

```bash
gitaudit visualize             # Open in browser
gitaudit viz --port 8080       # Custom port
```

### `gitaudit ci`

CI/CD mode with JSON output and exit codes.

```bash
gitaudit ci                         # Run all checks
gitaudit ci --fail-on-secrets       # Exit 1 if secrets found
gitaudit ci --fail-on-stale-flags   # Exit 1 if stale flags
gitaudit ci --fail-on-bloat 10      # Exit 1 if files > 10MB
gitaudit ci --fail-on-duplicates    # Exit 1 if duplicate authors
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

For convenience, `gp` is also available:

```bash
gp authors
gp bloat
gp ci
```

## License

MIT
