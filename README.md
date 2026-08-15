# 🎬 Movie Watchlist

A full-stack movie watchlist app with JWT authentication, per-user data isolation, and a custom "cinema ticket stub" themed UI. Built as a hands-on learning project covering the full stack — from schema design to deployment.

**Live app:** [movies-watch-list-nckm.vercel.app](https://movies-watch-list-nckm.vercel.app)
**Backend API:** [movieswatchlist-m3a1.onrender.com](https://movieswatchlist-m3a1.onrender.com)

> ⚠️ The backend is hosted on Render's free tier, which spins down after ~15 minutes of inactivity. The first request after idle time may take 30–60 seconds while the server wakes up.

---

## Features

- **User authentication** — register/login with hashed passwords (BCrypt) and JWT-based sessions
- **Per-user data isolation** — every user only sees and can modify their own movies; ownership is enforced at the service layer, not just hidden in the UI
- **Core CRUD operations** — add, view, filter, mark as watched, and delete movies (in-place editing of title/genre coming soon)
- **Filtering** — view all movies, or filter by status (queued/watched) and favorites
- **Input validation** — server-side validation (title required) with clean error responses
- **Centralized error handling** — a global `@RestControllerAdvice` handler returns structured JSON errors (not-found, permission, duplicate, invalid-credential, and validation failures) instead of raw stack traces
- **Responsive UI** — custom-designed interface that works from desktop down to mobile
- **Stateless auth** — no server-side sessions; every request is authenticated via a signed JWT

---

## Tech Stack

**Backend**
- Java 21, Spring Boot 4.1
- Spring Data JPA (Hibernate) + H2 (in-memory database)
- Spring Security + JWT (`io.jsonwebtoken`)
- Maven

**Frontend**
- React 18 + Vite
- Plain CSS (custom design system, no UI framework)

**Deployment**
- Backend: Docker container on Render
- Frontend: Vercel
- Version control: Git / GitHub

---

## Architecture

```
MovieWatchlist/
├── backend/
│   ├── src/main/java/com/example/MovieWatchlist/
│   │   ├── config/         # Security config, JWT filter & utility
│   │   ├── controller/     # REST endpoints
│   │   ├── dto/            # Request/response payloads
│   │   ├── entity/         # JPA entities (Movie, User)
│   │   ├── enums/          # WatchStatus
│   │   ├── exception/      # Custom exceptions + global handler
│   │   ├── repository/     # Spring Data JPA repositories
│   │   └── service/        # Business logic
│   └── Dockerfile
└── frontend/
    └── src/
        ├── App.jsx          # Main app, auth state, API calls
        ├── AuthScreen.jsx   # Login / register screen
        └── index.css        # Design system
```

The backend follows a standard layered architecture: **Controller → Service → Repository → Entity**, with a JWT filter sitting in front of every request to establish who's making it before it reaches business logic, and a global exception handler catching failures on the way out.

---

## Security Design

- Passwords are hashed with **BCrypt** before storage — never stored or returned in plaintext
- Authentication is **stateless**: no server-side session storage, every request proves identity via a signed JWT in the `Authorization` header
- A custom `OncePerRequestFilter` validates the token on every request and populates Spring Security's context
- **Ownership checks happen server-side**, not just in the UI — a logged-in user attempting to modify another user's movie is rejected with a `403`, even if they know the movie's ID
- CORS is configured centrally in `SecurityConfig` (via a `CorsConfigurationSource` bean) rather than per-controller, since Spring Security's filter chain intercepts CORS preflight requests before controller-level `@CrossOrigin` annotations would ever apply

---

## API Reference

**Base URL:** `/api/movies` (all routes below require `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/movies` | Add a new movie (defaults to `PENDING`) |
| GET | `/api/movies` | Get all movies for the logged-in user |
| GET | `/api/movies/status/{status}` | Filter by `PENDING` or `WATCHED` |
| GET | `/api/movies/favorites` | Get favorited movies |
| PUT | `/api/movies/{id}/watched` | Mark a movie as watched |
| DELETE | `/api/movies/{id}` | Delete a movie |

**Auth routes** (public, no token required):

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Log in, returns a JWT |

---

## Running Locally

### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`. H2 console available at `/h2-console`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.

> Update `API_BASE` and `AUTH_BASE` in `frontend/src/App.jsx` if your backend runs elsewhere, and make sure your local frontend URL is included in `SecurityConfig.java`'s CORS allowed origins.

---

## Known Limitations

- **H2 is in-memory** — all data resets on backend restart/redeploy. Fine for demoing, not for persistent use.
- **Cold starts** — Render's free tier sleeps after inactivity (see note at top).
- **No token refresh** — JWT expires after 24 hours and the user is simply logged out; no silent renewal yet.

---

## Roadmap

Planned improvements, roughly in order:

- [ ] Edit movie details after creation
- [ ] Search and sort
- [ ] Movie posters via a public movie API (OMDb/TMDb)
- [ ] Ratings and personal notes per movie
- [ ] Migrate from H2 to PostgreSQL for real persistence
- [ ] Refresh token flow
- [ ] Role-based access control
- [ ] Automated tests (JUnit + Mockito)

---

## What I Learned

This project was built end-to-end as a hands-on way to practice:
- Designing a layered Spring Boot architecture from scratch
- Implementing JWT authentication and understanding *why* stateless auth works the way it does
- Debugging real deployment issues (CORS preflight vs. Spring Security filter order, H2 reserved keywords, cold starts)
- Structuring a monorepo and deploying a decoupled frontend/backend to separate platforms
