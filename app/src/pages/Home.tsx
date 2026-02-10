import { useState } from 'react'
import { motion } from 'framer-motion'
import { UrlInput } from '../components/ui/UrlInput'
import { ExampleRepos } from '../components/ui/ExampleRepos'

interface HomeProps {
  onExplore: (url: string) => void
}

export function Home({ onExplore }: HomeProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Basic validation
    const trimmed = url.trim()
    if (!trimmed) {
      setError('Paste a GitHub URL to get started')
      return
    }
    
    // Accept various GitHub URL formats
    const githubPattern = /github\.com\/[\w-]+\/[\w.-]+/i
    if (!githubPattern.test(trimmed)) {
      setError('That doesn\'t look like a GitHub URL')
      return
    }
    
    onExplore(trimmed)
  }

  return (
    <div className="px-6 pt-24 pb-16">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center">
        <motion.h1 
          className="text-5xl sm:text-6xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          See your code's
          <br />
          <span className="text-[var(--color-accent)]">full story</span>
        </motion.h1>
        
        <motion.p 
          className="mt-6 text-xl text-[var(--color-text-muted)] max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Visualize any Git repository's history. 
          Who wrote what, when it changed, and why it matters.
        </motion.p>
      </div>

      {/* Input */}
      <motion.div 
        className="max-w-2xl mx-auto mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <form onSubmit={handleSubmit}>
          <UrlInput 
            value={url}
            onChange={setUrl}
            error={error}
            placeholder="github.com/facebook/react"
          />
        </form>
      </motion.div>

      {/* Examples */}
      <motion.div 
        className="max-w-2xl mx-auto mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-[var(--color-text-subtle)] text-center mb-4">
          Try these
        </p>
        <ExampleRepos onSelect={onExplore} />
      </motion.div>

      {/* Features preview */}
      <motion.div 
        className="max-w-4xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <FeatureCard
          icon="📊"
          title="Activity Timeline"
          description="See commits over time. Spot patterns, bursts, and quiet periods."
        />
        <FeatureCard
          icon="🔥"
          title="Hot Files"
          description="Find high-churn files. Where the action is, and where bugs hide."
        />
        <FeatureCard
          icon="👥"
          title="Team Map"
          description="Who owns what. Knowledge silos. Bus factor at a glance."
        />
        <FeatureCard
          icon="🛡️"
          title="Security Scanner"
          description="Detect secrets, CVEs, and supply chain risks with stunning 3D visualizations."
          highlight
        />
      </motion.div>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  highlight = false,
}: { 
  icon: string
  title: string
  description: string
  highlight?: boolean
}) {
  return (
    <div className={`
      p-6 rounded-xl border transition-colors
      ${highlight 
        ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-500/50' 
        : 'bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--color-border)]'
      }
    `}>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
      {highlight && (
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-purple-400 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
          New
        </div>
      )}
    </div>
  )
}
