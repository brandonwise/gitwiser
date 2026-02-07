import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Commit } from '../../lib/github'

interface FileListProps {
  commits: Commit[]  // Will be used when we implement file-level commit fetching
}

// Note: GitHub's list commits API doesn't include files by default
// For MVP, we'll show a placeholder and note that we need commit details
// In production, we'd fetch commit details for file-level data

export function FileList({ commits: _commits }: FileListProps) {
  const [view, setView] = useState<'list' | 'tree'>('list')
  
  // Since we don't have file data from the basic commits endpoint,
  // we'll show a coming soon state with the feature description
  
  return (
    <div>
      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <ViewToggle 
          active={view === 'list'} 
          onClick={() => setView('list')}
        >
          List
        </ViewToggle>
        <ViewToggle 
          active={view === 'tree'} 
          onClick={() => setView('tree')}
        >
          Treemap
        </ViewToggle>
      </div>

      {view === 'list' ? (
        <HotFilesList />
      ) : (
        <FileTreemap />
      )}
    </div>
  )
}

function ViewToggle({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode
  active: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${active 
          ? 'bg-[var(--color-accent)] text-black' 
          : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        }
      `}
    >
      {children}
    </button>
  )
}

function HotFilesList() {
  // Mock data for visual preview
  const mockFiles = [
    { path: 'src/index.ts', changes: 156, trend: 'up' as const },
    { path: 'src/components/App.tsx', changes: 134, trend: 'up' as const },
    { path: 'package.json', changes: 89, trend: 'stable' as const },
    { path: 'src/lib/utils.ts', changes: 67, trend: 'down' as const },
    { path: 'README.md', changes: 45, trend: 'stable' as const },
    { path: 'src/styles/main.css', changes: 42, trend: 'up' as const },
    { path: 'tsconfig.json', changes: 23, trend: 'stable' as const },
    { path: '.github/workflows/ci.yml', changes: 19, trend: 'down' as const },
  ]
  
  const maxChanges = Math.max(...mockFiles.map(f => f.changes))

  return (
    <div className="p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Most Changed Files</h3>
        <span className="text-xs text-[var(--color-text-subtle)] bg-[var(--color-bg-hover)] px-2 py-1 rounded">
          Preview Data
        </span>
      </div>
      
      <div className="space-y-3">
        {mockFiles.map((file, i) => (
          <motion.div
            key={file.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 group cursor-pointer"
          >
            {/* File icon */}
            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-hover)] flex items-center justify-center flex-shrink-0">
              <FileIcon extension={file.path.split('.').pop() || ''} />
            </div>
            
            {/* Path */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono truncate group-hover:text-[var(--color-accent)] transition-colors">
                {file.path}
              </p>
            </div>
            
            {/* Change bar */}
            <div className="w-24 flex items-center gap-2">
              <div className="flex-1 h-2 bg-[var(--color-bg-hover)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: getHeatColor(file.changes / maxChanges)
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(file.changes / maxChanges) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                />
              </div>
            </div>
            
            {/* Count + trend */}
            <div className="flex items-center gap-1 w-16 justify-end">
              <TrendIcon trend={file.trend} />
              <span className="text-sm text-[var(--color-text-muted)]">
                {file.changes}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <p className="mt-6 text-sm text-[var(--color-text-subtle)] text-center">
        Full file analysis requires fetching individual commits.
        <br />
        Coming in the next version.
      </p>
    </div>
  )
}

function FileTreemap() {
  return (
    <div className="p-6 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Code Ownership Treemap</h3>
        <span className="text-xs text-[var(--color-text-subtle)] bg-[var(--color-bg-hover)] px-2 py-1 rounded">
          Coming Soon
        </span>
      </div>
      
      {/* Placeholder treemap visualization */}
      <div className="aspect-video bg-[var(--color-bg)] rounded-lg overflow-hidden p-2 flex flex-wrap gap-1">
        {[
          { name: 'src', size: 40, color: 'var(--color-author-1)' },
          { name: 'lib', size: 25, color: 'var(--color-author-2)' },
          { name: 'tests', size: 20, color: 'var(--color-author-3)' },
          { name: 'docs', size: 10, color: 'var(--color-author-4)' },
          { name: 'config', size: 5, color: 'var(--color-author-5)' },
        ].map((dir, i) => (
          <motion.div
            key={dir.name}
            className="rounded-md flex items-center justify-center text-black text-sm font-medium"
            style={{ 
              backgroundColor: dir.color,
              width: `${dir.size}%`,
              flexGrow: dir.size,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {dir.name}/
          </motion.div>
        ))}
      </div>
      
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">
        See directory sizes and ownership at a glance. 
        Click to drill into subdirectories.
      </p>
    </div>
  )
}

function FileIcon({ extension }: { extension: string }) {
  const colors: Record<string, string> = {
    ts: '#3178c6',
    tsx: '#3178c6',
    js: '#f7df1e',
    jsx: '#f7df1e',
    json: '#cbcb41',
    md: '#519aba',
    css: '#563d7c',
    scss: '#c6538c',
    yml: '#cb171e',
    yaml: '#cb171e',
  }
  
  return (
    <div 
      className="w-4 h-4 rounded-sm"
      style={{ backgroundColor: colors[extension] || 'var(--color-text-subtle)' }}
    />
  )
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return <span className="text-[var(--color-error)] text-xs">↑</span>
  }
  if (trend === 'down') {
    return <span className="text-[var(--color-success)] text-xs">↓</span>
  }
  return <span className="text-[var(--color-text-subtle)] text-xs">→</span>
}

function getHeatColor(intensity: number): string {
  if (intensity < 0.3) return 'var(--color-heat-cold)'
  if (intensity < 0.6) return 'var(--color-heat-warm)'
  return 'var(--color-heat-hot)'
}
