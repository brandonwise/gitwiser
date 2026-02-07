import { useState } from 'react'
import { Home } from './pages/Home'
import { RepoView } from './pages/RepoView'
import { Header } from './components/layout/Header'

type View = 'home' | 'repo'

interface AppState {
  view: View
  repoUrl: string | null
}

export default function App() {
  const [state, setState] = useState<AppState>({
    view: 'home',
    repoUrl: null,
  })

  const handleExplore = (url: string) => {
    setState({ view: 'repo', repoUrl: url })
  }

  const handleBack = () => {
    setState({ view: 'home', repoUrl: null })
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header onBack={state.view !== 'home' ? handleBack : undefined} />
      
      <main>
        {state.view === 'home' && <Home onExplore={handleExplore} />}
        {state.view === 'repo' && state.repoUrl && (
          <RepoView url={state.repoUrl} />
        )}
      </main>
    </div>
  )
}
