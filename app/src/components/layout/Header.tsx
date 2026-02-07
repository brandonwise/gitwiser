import { motion } from 'framer-motion'

interface HeaderProps {
  onBack?: () => void
}

export function Header({ onBack }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border-subtle)]">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <motion.button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -2 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )}
          
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo />
            <span className="font-semibold text-lg">Git Time Machine</span>
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/brandonwise/git-time-machine"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <GitHubIcon className="w-5 h-5" />
          </a>
        </div>
      </nav>
    </header>
  )
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      {/* Clock face */}
      <circle 
        cx="16" 
        cy="16" 
        r="14" 
        stroke="var(--color-accent)" 
        strokeWidth="2"
      />
      {/* Hour hand */}
      <path 
        d="M16 16L16 9" 
        stroke="var(--color-text)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Minute hand */}
      <path 
        d="M16 16L22 16" 
        stroke="var(--color-text)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx="16" cy="16" r="2" fill="var(--color-accent)" />
      {/* Rewind arrow */}
      <path 
        d="M8 8L4 12L8 16" 
        stroke="var(--color-accent)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}
