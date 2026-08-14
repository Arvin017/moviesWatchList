import { useEffect, useState, useCallback } from 'react'
import AuthScreen from './AuthScreen.jsx'

// Change this to your deployed Render backend URL when you deploy
const API_BASE = 'https://movieswatchlist-m3a1.onrender.com/api/movies'
const AUTH_BASE = 'https://movieswatchlist-m3a1.onrender.com/auth'

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Queued' },
  { key: 'WATCHED', label: 'Watched' },
  { key: 'FAVORITES', label: 'Favorites' },
]

function urlForTab(tab) {
  if (tab === 'ALL') return API_BASE
  if (tab === 'FAVORITES') return `${API_BASE}/favorites`
  return `${API_BASE}/status/${tab}`
}

export default function App() {
  // --- Auth state ---
  const [token, setToken] = useState(() => localStorage.getItem('watchlist_token'))
  const [username, setUsername] = useState(() => localStorage.getItem('watchlist_username'))
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  // --- Movie state ---
  const [movies, setMovies] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyIds, setBusyIds] = useState({})

  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [favorite, setFavorite] = useState(false)
  const [titleError, setTitleError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const authHeader = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  )

  const logout = useCallback(() => {
    localStorage.removeItem('watchlist_token')
    localStorage.removeItem('watchlist_username')
    setToken(null)
    setUsername(null)
    setMovies([])
  }, [])

  // Handle expired/invalid tokens on any fetch
  const authedFetch = useCallback(
    async (url, options = {}) => {
      const res = await fetch(url, {
        ...options,
        headers: { ...(options.headers || {}), ...authHeader() },
      })
      if (res.status === 401 || res.status === 403) {
        logout()
        throw new Error('Session expired. Please sign in again.')
      }
      return res
    },
    [authHeader, logout]
  )

  const loadMovies = useCallback(
    async (tab) => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const res = await authedFetch(urlForTab(tab))
        if (!res.ok) throw new Error('Request failed')
        const data = await res.json()
        setMovies(data)
      } catch (err) {
        setError(
          err.message === 'Session expired. Please sign in again.'
            ? err.message
            : "Can't reach the server. Make sure your backend is running."
        )
        setMovies([])
      } finally {
        setLoading(false)
      }
    },
    [token, authedFetch]
  )

  useEffect(() => {
    if (token) loadMovies(activeTab)
  }, [activeTab, token, loadMovies])

  // --- Auth handlers ---
  const handleLogin = async (user, pass) => {
    setAuthBusy(true)
    setAuthError('')
    try {
      const res = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      })
      if (!res.ok) {
        setAuthError('Wrong username or password.')
        return
      }
      const newToken = await res.text()
      localStorage.setItem('watchlist_token', newToken)
      localStorage.setItem('watchlist_username', user)
      setToken(newToken)
      setUsername(user)
    } catch (err) {
      setAuthError("Can't reach the server. Make sure your backend is running.")
    } finally {
      setAuthBusy(false)
    }
  }

  const handleRegister = async (user, pass) => {
    setAuthBusy(true)
    setAuthError('')
    try {
      const res = await fetch(`${AUTH_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      })
      if (!res.ok) {
        setAuthError('That username is already taken.')
        return
      }
      // Auto login right after successful registration
      await handleLogin(user, pass)
    } catch (err) {
      setAuthError("Can't reach the server. Make sure your backend is running.")
    } finally {
      setAuthBusy(false)
    }
  }

  const setBusy = (id, val) => setBusyIds((prev) => ({ ...prev, [id]: val }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('Title cannot be empty')
      return
    }
    setTitleError('')
    setSubmitting(true)
    setError('')
    try {
      const res = await authedFetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), genre: genre.trim(), favorite }),
      })
      if (res.status === 400) {
        setTitleError('Title cannot be empty')
        return
      }
      if (!res.ok) throw new Error('Request failed')
      setTitle('')
      setGenre('')
      setFavorite(false)
      await loadMovies(activeTab)
    } catch (err) {
      setError("Couldn't add that movie. Check that the backend is running.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkWatched = async (id) => {
    setBusy(id, true)
    setError('')
    try {
      const res = await authedFetch(`${API_BASE}/${id}/watched`, { method: 'PUT' })
      if (!res.ok) throw new Error('Request failed')
      await loadMovies(activeTab)
    } catch (err) {
      setError("Couldn't update that movie.")
    } finally {
      setBusy(id, false)
    }
  }

  const handleDelete = async (id) => {
    setBusy(id, true)
    setError('')
    try {
      const res = await authedFetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Request failed')
      setMovies((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError("Couldn't delete that movie.")
    } finally {
      setBusy(id, false)
    }
  }

  // --- Not logged in: show auth screen ---
  if (!token) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        authError={authError}
        authBusy={authBusy}
      />
    )
  }

  return (
    <div className="page">
      <div className="topbar">
        <span className="topbar-user">
          Signed in as <strong>{username}</strong>
        </span>
        <button className="logout-btn" onClick={logout}>
          Sign out
        </button>
      </div>

      <header className="hero">
        <div className="hero-eyebrow">Personal Screening List</div>
        <h1 className="hero-title">Your Watchlist</h1>
        <p className="hero-sub">
          Queue what you're planning to watch, stamp it once it's done,
          and keep your favorites lit up.
        </p>
        <div className="marquee-lights" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      </header>

      <section className="booth">
        <form className="booth-form" onSubmit={handleAdd}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Inception"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError('')
              }}
              className={titleError ? 'field-error' : ''}
            />
            {titleError && <span className="field-hint">{titleError}</span>}
          </div>

          <div className="field">
            <label htmlFor="genre">Genre</label>
            <input
              id="genre"
              type="text"
              placeholder="e.g. Sci-Fi"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>

          <label className="fav-toggle">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
            />
            <span className="fav-star">★</span>
            <span className="fav-toggle-label">Favorite</span>
          </label>

          <button type="submit" className="btn-primary booth-submit" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add to queue'}
          </button>
        </form>
      </section>

      <nav className="reel">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`reel-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <div className="banner-error">{error}</div>}

      {loading && (
        <div className="state-block">
          <div className="spinner" />
          <p className="state-sub">Loading your list…</p>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="state-block">
          <h2 className="state-title">Nothing here yet</h2>
          <p className="state-sub">
            {activeTab === 'ALL'
              ? 'Add your first pick above to start the show.'
              : 'No movies match this filter right now.'}
          </p>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <div className="grid">
          {movies.map((movie) => (
            <article className="ticket" key={movie.id}>
              <div className="ticket-spine">
                <h3 className="ticket-title">{movie.title}</h3>
                {movie.genre && <div className="ticket-genre">{movie.genre}</div>}
                <span className={`ticket-fav ${movie.favorite ? 'is-fav' : ''}`} aria-hidden="true">
                  {movie.favorite ? '★' : '☆'}
                </span>
              </div>

              <div className="ticket-perf">
                <span className="ticket-notch left" />
                <span className="ticket-notch right" />
              </div>

              <div className="ticket-body">
                <span className={`stamp ${movie.status === 'WATCHED' ? 'stamp-watched' : 'stamp-pending'}`}>
                  {movie.status === 'WATCHED' ? 'Watched' : 'Queued'}
                </span>

                <div className="ticket-actions">
                  {movie.status !== 'WATCHED' && (
                    <button
                      className="icon-btn watch-btn"
                      title="Mark as watched"
                      onClick={() => handleMarkWatched(movie.id)}
                      disabled={busyIds[movie.id]}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="icon-btn delete-btn"
                    title="Delete"
                    onClick={() => handleDelete(movie.id)}
                    disabled={busyIds[movie.id]}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
