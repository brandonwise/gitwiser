const API_BASE = 'https://api.github.com'

export interface RepoInfo {
  owner: string
  name: string
  description: string | null
  stars: number
  forks: number
  language: string | null
  createdAt: string
  updatedAt: string
}

export interface Commit {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
    avatar?: string
    login?: string
  }
  files?: {
    filename: string
    additions: number
    deletions: number
    changes: number
  }[]
}

export interface ParsedUrl {
  owner: string
  repo: string
  path?: string
  branch?: string
}

/**
 * Parse various GitHub URL formats
 */
export function parseGitHubUrl(url: string): ParsedUrl | null {
  // Clean up the URL
  let clean = url.trim()
  if (!clean.startsWith('http')) {
    clean = `https://${clean}`
  }

  try {
    const parsed = new URL(clean)
    if (!parsed.hostname.includes('github.com')) {
      return null
    }

    const parts = parsed.pathname.split('/').filter(Boolean)
    if (parts.length < 2) {
      return null
    }

    const result: ParsedUrl = {
      owner: parts[0],
      repo: parts[1].replace('.git', ''),
    }

    // Handle blob/tree paths like github.com/org/repo/blob/main/src/file.ts
    if (parts.length > 3 && (parts[2] === 'blob' || parts[2] === 'tree')) {
      result.branch = parts[3]
      result.path = parts.slice(4).join('/')
    }

    return result
  } catch {
    return null
  }
}

/**
 * Fetch repository information
 */
export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}`)
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Repository not found')
    }
    if (res.status === 403) {
      throw new Error('Rate limit exceeded. Try again in a minute.')
    }
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const data = await res.json()

  return {
    owner: data.owner.login,
    name: data.name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    language: data.language,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Fetch commit history
 */
export async function fetchCommits(
  owner: string, 
  repo: string, 
  options: { per_page?: number; path?: string } = {}
): Promise<Commit[]> {
  const params = new URLSearchParams({
    per_page: String(options.per_page || 100),
  })
  
  if (options.path) {
    params.set('path', options.path)
  }

  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/commits?${params}`)
  
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Repository not found')
    }
    if (res.status === 403) {
      throw new Error('Rate limit exceeded. Try again in a minute.')
    }
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const data = await res.json()

  return data.map((c: any) => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0], // First line only
    author: {
      name: c.commit.author.name,
      email: c.commit.author.email,
      date: c.commit.author.date,
      avatar: c.author?.avatar_url,
      login: c.author?.login,
    },
  }))
}

/**
 * Fetch detailed commit info (includes files changed)
 */
export async function fetchCommitDetail(
  owner: string, 
  repo: string, 
  sha: string
): Promise<Commit> {
  const res = await fetch(`${API_BASE}/repos/${owner}/${repo}/commits/${sha}`)
  
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const c = await res.json()

  return {
    sha: c.sha,
    message: c.commit.message,
    author: {
      name: c.commit.author.name,
      email: c.commit.author.email,
      date: c.commit.author.date,
      avatar: c.author?.avatar_url,
      login: c.author?.login,
    },
    files: c.files?.map((f: any) => ({
      filename: f.filename,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
    })),
  }
}
