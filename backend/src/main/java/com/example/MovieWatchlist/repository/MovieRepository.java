package com.example.MovieWatchlist.repository;

import com.example.MovieWatchlist.entity.Movie;
import com.example.MovieWatchlist.entity.User;
import com.example.MovieWatchlist.enums.WatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByOwner(User owner);
    List<Movie> findByOwnerAndStatus(User owner, WatchStatus status);
    List<Movie> findByOwnerAndFavoriteTrue(User owner);
}