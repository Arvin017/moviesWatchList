import { useEffect, useState, useCallback } from 'react'

// Change this if your backend runs somewhere else
const API_BASE = 'http://localhost:8080/api/movies'

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

  const loadMovies = useCallback(async (tab) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(urlForTab(tab))
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setMovies(data)
    } catch (err) {
      setError(
        "Can't reach the server. Make sure your Spring Boot backend is running on localhost:8080."
      )
      setMovies([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMovies(activeTab)
  }, [activeTab, loadMovies])

  const setBusy = (id, val) =>
    setBusyIds((prev) => ({ ...prev, [id]: val }))

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
      const res = await fetch(API_BASE, {
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
      const res = await fetch(`${API_BASE}/${id}/watched`, { method: 'PUT' })
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
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Request failed')
      setMovies((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      setError("Couldn't delete that movie.")
    } finally {
      setBusy(id, false)
    }
  }

  const counts = {
    ALL: null,
    PENDING: null,
    WATCHED: null,
    FAVORITES: null,
  }

  return (
    <div className="page">
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
