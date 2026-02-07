import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Commit } from '../../lib/github'

interface TimelineProps {
  commits: Commit[]
}

// Group commits by week for the heatmap
function groupByWeek(commits: Commit[]) {
  const weeks = new Map<string, { date: Date; count: number; commits: Commit[] }>()
  
  commits.forEach(commit => {
    const date = new Date(commit.author.date)
    // Get start of week (Sunday)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const key = weekStart.toISOString()
    const existing = weeks.get(key)
    
    if (existing) {
      existing.count++
      existing.commits.push(commit)
    } else {
      weeks.set(key, { date: weekStart, count: 1, commits: [commit] })
    }
  })
  
  return Array.from(weeks.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function Timeline({ commits }: TimelineProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  
  const weeks = useMemo(() => groupByWeek(commits), [commits])
  const maxCount = Math.max(...weeks.map(w => w.count))
  
  // Last 52 weeks
  const recentWeeks = weeks.slice(-52)

  return (
    <div>
      {/* Activity heatmap */}
      <div className="p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Commit Activity</h3>
          <span className="text-sm text-[var(--color-text-muted)]">
            Last 52 weeks
          </span>
        </div>
        
        {/* Week grid */}
        <div className="flex gap-1 overflow-x-auto pb-2">
          {recentWeeks.map((week, i) => {
            const intensity = week.count / maxCount
            return (
              <motion.button
                key={week.date.toISOString()}
                onClick={() => setSelectedWeek(selectedWeek === i ? null : i)}
                className="flex-shrink-0 w-3 h-3 rounded-sm transition-transform hover:scale-125"
                style={{
                  backgroundColor: getHeatColor(intensity),
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                title={`${week.count} commits - ${formatWeek(week.date)}`}
              />
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-[var(--color-text-muted)]">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 1].map(intensity => (
              <div 
                key={intensity}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getHeatColor(intensity) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Selected week detail */}
      {selectedWeek !== null && recentWeeks[selectedWeek] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]"
        >
          <h4 className="font-semibold mb-4">
            Week of {formatWeek(recentWeeks[selectedWeek].date)}
            <span className="ml-2 text-[var(--color-text-muted)] font-normal">
              {recentWeeks[selectedWeek].count} commits
            </span>
          </h4>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentWeeks[selectedWeek].commits.map(commit => (
              <CommitRow key={commit.sha} commit={commit} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent commits */}
      <div className="mt-6 p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <h3 className="font-semibold mb-4">Recent Commits</h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {commits.slice(0, 20).map((commit, i) => (
            <motion.div
              key={commit.sha}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <CommitRow commit={commit} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CommitRow({ commit }: { commit: Commit }) {
  return (
    <div className="flex items-start gap-3">
      {commit.author.avatar ? (
        <img 
          src={commit.author.avatar} 
          alt={commit.author.name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium">
            {commit.author.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{commit.message}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {commit.author.name} · {formatDate(commit.author.date)}
        </p>
      </div>
      
      <code className="text-xs text-[var(--color-text-subtle)] font-mono flex-shrink-0">
        {commit.sha.slice(0, 7)}
      </code>
    </div>
  )
}

function getHeatColor(intensity: number): string {
  if (intensity < 0.1) return 'var(--color-bg-hover)'
  if (intensity < 0.3) return '#1e3a5f'
  if (intensity < 0.5) return '#2563eb'
  if (intensity < 0.7) return '#f59e0b'
  return '#ef4444'
}

function formatWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}
