import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Commit } from '../../lib/github'

interface ContributorListProps {
  commits: Commit[]
}

interface Contributor {
  name: string
  login?: string
  email: string
  avatar?: string
  commits: number
  firstCommit: Date
  lastCommit: Date
}

const AUTHOR_COLORS = [
  'var(--color-author-1)',
  'var(--color-author-2)',
  'var(--color-author-3)',
  'var(--color-author-4)',
  'var(--color-author-5)',
  'var(--color-author-6)',
  'var(--color-author-7)',
  'var(--color-author-8)',
]

function aggregateContributors(commits: Commit[]): Contributor[] {
  const map = new Map<string, Contributor>()
  
  commits.forEach(commit => {
    const key = commit.author.email.toLowerCase()
    const date = new Date(commit.author.date)
    const existing = map.get(key)
    
    if (existing) {
      existing.commits++
      if (date < existing.firstCommit) existing.firstCommit = date
      if (date > existing.lastCommit) existing.lastCommit = date
      // Prefer avatars and logins when available
      if (commit.author.avatar && !existing.avatar) {
        existing.avatar = commit.author.avatar
      }
      if (commit.author.login && !existing.login) {
        existing.login = commit.author.login
      }
    } else {
      map.set(key, {
        name: commit.author.name,
        login: commit.author.login,
        email: commit.author.email,
        avatar: commit.author.avatar,
        commits: 1,
        firstCommit: date,
        lastCommit: date,
      })
    }
  })
  
  return Array.from(map.values()).sort((a, b) => b.commits - a.commits)
}

export function ContributorList({ commits }: ContributorListProps) {
  const contributors = useMemo(() => aggregateContributors(commits), [commits])
  const totalCommits = commits.length
  
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Distribution chart */}
      <div className="p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <h3 className="font-semibold mb-4">Contribution Share</h3>
        
        {/* Stacked bar */}
        <div className="h-8 rounded-lg overflow-hidden flex">
          {contributors.slice(0, 8).map((contributor, i) => {
            const pct = (contributor.commits / totalCommits) * 100
            return (
              <motion.div
                key={contributor.email}
                className="h-full relative group"
                style={{ 
                  width: `${pct}%`,
                  backgroundColor: AUTHOR_COLORS[i % AUTHOR_COLORS.length],
                  minWidth: pct > 0 ? '4px' : '0',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity" />
              </motion.div>
            )
          })}
          {contributors.length > 8 && (
            <motion.div
              className="h-full bg-[var(--color-bg-hover)]"
              style={{ 
                width: `${contributors.slice(8).reduce((sum, c) => sum + c.commits, 0) / totalCommits * 100}%` 
              }}
              initial={{ width: 0 }}
              animate={{ width: `${contributors.slice(8).reduce((sum, c) => sum + c.commits, 0) / totalCommits * 100}%` }}
              transition={{ duration: 0.5, delay: 0.4 }}
            />
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          {contributors.slice(0, 6).map((contributor, i) => (
            <div key={contributor.email} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: AUTHOR_COLORS[i % AUTHOR_COLORS.length] }}
              />
              <span className="text-[var(--color-text-muted)]">
                {contributor.login || contributor.name.split(' ')[0]}
              </span>
            </div>
          ))}
          {contributors.length > 6 && (
            <span className="text-sm text-[var(--color-text-subtle)]">
              +{contributors.length - 6} others
            </span>
          )}
        </div>
      </div>

      {/* Stats summary */}
      <div className="p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <h3 className="font-semibold mb-4">Team Health</h3>
        
        <div className="space-y-4">
          <StatRow 
            label="Contributors" 
            value={contributors.length.toString()} 
            subtext="unique authors"
          />
          <StatRow 
            label="Bus Factor" 
            value={getBusFactor(contributors, totalCommits).toString()} 
            subtext={getBusFactor(contributors, totalCommits) < 3 ? '⚠️ Low' : '✓ Healthy'}
            highlight={getBusFactor(contributors, totalCommits) < 3}
          />
          <StatRow 
            label="Top Contributor" 
            value={`${Math.round((contributors[0]?.commits || 0) / totalCommits * 100)}%`} 
            subtext={contributors[0]?.name || 'N/A'}
          />
        </div>
      </div>

      {/* Full contributor list */}
      <div className="lg:col-span-2 p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <h3 className="font-semibold mb-4">All Contributors</h3>
        
        <div className="space-y-3">
          {contributors.map((contributor, i) => (
            <motion.div
              key={contributor.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4"
            >
              {/* Avatar */}
              {contributor.avatar ? (
                <img 
                  src={contributor.avatar} 
                  alt={contributor.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-black font-medium"
                  style={{ backgroundColor: AUTHOR_COLORS[i % AUTHOR_COLORS.length] }}
                >
                  {contributor.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{contributor.name}</span>
                  {contributor.login && (
                    <span className="text-sm text-[var(--color-text-muted)]">
                      @{contributor.login}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Active {formatDateRange(contributor.firstCommit, contributor.lastCommit)}
                </p>
              </div>
              
              {/* Commits bar */}
              <div className="w-32 flex items-center gap-2">
                <div className="flex-1 h-2 bg-[var(--color-bg-hover)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: AUTHOR_COLORS[i % AUTHOR_COLORS.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(contributor.commits / contributors[0].commits) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.02 }}
                  />
                </div>
                <span className="text-sm text-[var(--color-text-muted)] w-12 text-right">
                  {contributor.commits}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatRow({ 
  label, 
  value, 
  subtext, 
  highlight 
}: { 
  label: string
  value: string
  subtext: string
  highlight?: boolean 
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <div className="text-right">
        <span className={`font-semibold ${highlight ? 'text-[var(--color-warning)]' : ''}`}>
          {value}
        </span>
        <span className="text-sm text-[var(--color-text-subtle)] ml-2">{subtext}</span>
      </div>
    </div>
  )
}

// Bus factor: minimum contributors needed for 50% of commits
function getBusFactor(contributors: Contributor[], total: number): number {
  let sum = 0
  for (let i = 0; i < contributors.length; i++) {
    sum += contributors[i].commits
    if (sum >= total * 0.5) return i + 1
  }
  return contributors.length
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (startStr === endStr) return startStr
  return `${startStr} – ${endStr}`
}
