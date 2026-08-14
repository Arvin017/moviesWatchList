package com.example.MovieWatchlist.service;

import com.example.MovieWatchlist.entity.Movie;
import com.example.MovieWatchlist.entity.User;
import com.example.MovieWatchlist.enums.WatchStatus;
import com.example.MovieWatchlist.repository.MovieRepository;
import com.example.MovieWatchlist.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Movie addMovie(Movie movie) {
        movie.setStatus(WatchStatus.PENDING);
        movie.setOwner(getCurrentUser());
        return movieRepository.save(movie);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findByOwner(getCurrentUser());
    }

    public List<Movie> getMoviesByStatus(WatchStatus status) {
        return movieRepository.findByOwnerAndStatus(getCurrentUser(), status);
    }

    public List<Movie> getFavoriteMovies() {
        return movieRepository.findByOwnerAndFavoriteTrue(getCurrentUser());
    }

    public Movie markAsWatched(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        if (movie.getOwner().getId() != getCurrentUser().getId()) {
            throw new RuntimeException("You don't have permission to modify this movie");
        }

        movie.setStatus(WatchStatus.WATCHED);
        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found"));

        if (movie.getOwner().getId() != getCurrentUser().getId()) {
            throw new RuntimeException("You don't have permission to delete this movie");
        }

        movieRepository.deleteById(id);
    }
}