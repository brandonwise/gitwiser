# gitwiser

**Git repository health check.**

One CLI to analyze any repo:
- 👥 **Authors** — detect duplicates, generate .mailmap
- 🚩 **Flags** — find stale feature flags  
- 🐷 **Bloat** — locate large files in history
- 🔐 **Security** — secret detection, CI integration
- 📊 **Visualize** — web UI for exploration

## Installation

```bash
npm install -g gitwiser
```

## Quick Start

```bash
# Full health check
gitwiser

# Specific checks
gitwiser authors      # Duplicate detection
gitwiser flags        # Stale feature flags
gitwiser bloat        # Large files

# CI mode
gitwiser ci --fail-on-secrets
```

## Commands

### `gitwiser` / `gitwiser analyze`

Run full repository analysis.

```bash
gitwiser                          # All checks
gitwiser --include authors,flags  # Specific modules
gitwiser --output json            # JSON output
```

### `gitwiser authors`

Detect duplicate Git identities and generate .mailmap files.

```bash
gitwiser authors                  # Text summary
gitwiser authors --output mailmap # Generate .mailmap
gitwiser authors --apply          # Write .mailmap file
gitwiser authors --threshold 80   # Higher match threshold
```

### `gitwiser flags`

Find stale feature flags (hardcoded to true/false).

```bash
gitwiser flags                 # Text summary
gitwiser flags --stale-only    # Only stale flags
gitwiser flags --diff          # Generate cleanup patches
gitwiser flags --output json   # JSON for CI
```

Detects patterns from:
- LaunchDarkly, Split.io, Unleash, Flipper
- Environment variables (`FEATURE_*`)
- Generic patterns (`isFeatureEnabled()`, etc.)

### `gitwiser bloat`

Find large files bloating your repository.

```bash
gitwiser bloat                    # Top 20 largest
gitwiser bloat --limit 50         # More files
gitwiser bloat --include-deleted  # Include deleted files
gitwiser bloat --min-size 5242880 # 5MB minimum
```

### `gitwiser visualize`

Launch web UI for interactive visualization.

```bash
gitwiser visualize             # Open in browser
gitwiser viz --port 8080       # Custom port
```

### `gitwiser ci`

CI/CD mode with JSON output and exit codes.

```bash
gitwiser ci                         # Run all checks
gitwiser ci --fail-on-secrets       # Exit 1 if secrets found
gitwiser ci --fail-on-stale-flags   # Exit 1 if stale flags
gitwiser ci --fail-on-bloat 10      # Exit 1 if files > 10MB
gitwiser ci --fail-on-duplicates    # Exit 1 if duplicate authors
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

Short alias `gw` is also available:

```bash
gw authors
gw bloat
gw ci
```

## License

MIT
