package com.example.MovieWatchlist.service;


import org.springframework.stereotype.Service;
import com.example.MovieWatchlist.entity.Movie;
import com.example.MovieWatchlist.enums.WatchStatus;
import com.example.MovieWatchlist.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class MovieService {
    @Autowired
    private MovieRepository movieRepository;

    public Movie addMovie(Movie movie){
        movie.setStatus(WatchStatus.PENDING);
        return movieRepository.save(movie);
    }
    public List<Movie> getAllMovies(){
        return movieRepository.findAll();
    }
    public List<Movie> getMoviesByStatus(WatchStatus status){
        return movieRepository.findByStatus(status);
    }
    public Movie markAsWatched(Long id){
        Movie movie=movieRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Movie not found"));
        movie.setStatus(WatchStatus.WATCHED);
        return movieRepository.save(movie);
    }

    public void deleteMovie(Long id) {
        movieRepository.deleteById(id);
    }

    public List<Movie> getFavoriteMovies() {
        return movieRepository.findByFavoriteTrue();
    }

}
