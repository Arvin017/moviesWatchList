package com.example.MovieWatchlist.controller;

import com.example.MovieWatchlist.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.MovieWatchlist.entity.Movie;
import com.example.MovieWatchlist.enums.WatchStatus;
import com.example.MovieWatchlist.service.MovieService;
import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @PostMapping
    public Movie addMovie(@Valid @RequestBody Movie movie) {
        return movieService.addMovie(movie);
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/status/{status}")
    public List<Movie> getByStatus(@PathVariable WatchStatus status) {
        return movieService.getMoviesByStatus(status);
    }

    @PutMapping("/{id}/watched")
    public Movie markWatched(@PathVariable Long id) {
        return movieService.markAsWatched(id);
    }

    @DeleteMapping("/{id}")
    public void deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
    }

    @GetMapping("/favorites")
    public List<Movie> getFavorites() {
        return movieService.getFavoriteMovies();
    }
}
