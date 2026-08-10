# Movie Watchlist — Frontend

## Setup

1. Unzip this folder anywhere on your machine
2. Open a terminal inside the folder
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open the URL it prints (usually `http://localhost:5173`)

## Before you run it

Your Spring Boot backend must be running on `http://localhost:8080` first —
this frontend calls it directly (`/api/movies` and friends).

If your backend runs on a different port, open `src/App.jsx` and change
this line near the top:

```js
const API_BASE = 'http://localhost:8080/api/movies'
```

## One thing to fix on the backend: CORS

Your browser will block requests from `localhost:5173` to `localhost:8080`
unless the backend explicitly allows it. Add this to your
`MovieController.java`:

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/movies")
public class MovieController {
    ...
}
```

Without this, you'll see a CORS error in the browser console and every
request will fail — this is expected and not a bug in the frontend.

## What's wired up

- Add a movie (title, genre, favorite)
- Filter tabs: All / Queued / Watched / Favorites
- Mark as watched
- Delete a movie
- Inline validation matching your backend's `@NotBlank` rule
