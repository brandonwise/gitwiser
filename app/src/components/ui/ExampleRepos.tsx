interface ExampleReposProps {
  onSelect: (url: string) => void
}

const EXAMPLES = [
  { 
    name: 'React', 
    url: 'github.com/facebook/react',
    stars: '232k'
  },
  { 
    name: 'Vue', 
    url: 'github.com/vuejs/core',
    stars: '48k'
  },
  { 
    name: 'Rust', 
    url: 'github.com/rust-lang/rust',
    stars: '102k'
  },
  { 
    name: 'Go', 
    url: 'github.com/golang/go',
    stars: '128k'
  },
]

export function ExampleRepos({ onSelect }: ExampleReposProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {EXAMPLES.map((repo) => (
        <button
          key={repo.url}
          onClick={() => onSelect(`https://${repo.url}`)}
          className="
            px-4 py-2
            bg-[var(--color-bg-elevated)] 
            border border-[var(--color-border-subtle)]
            hover:border-[var(--color-border)] 
            hover:bg-[var(--color-bg-hover)]
            rounded-lg
            text-sm
            flex items-center gap-2
            transition-all duration-150
          "
        >
          <span className="font-medium">{repo.name}</span>
          <span className="text-[var(--color-text-subtle)]">★ {repo.stars}</span>
        </button>
      ))}
    </div>
  )
}
