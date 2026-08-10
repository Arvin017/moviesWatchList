package com.example.MovieWatchlist.repository;

import com.example.MovieWatchlist.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.example.MovieWatchlist.enums.WatchStatus;
import org.springframework.stereotype.Repository;


@Repository
public interface MovieRepository extends JpaRepository<Movie,Long> {
    List<Movie> findByStatus(WatchStatus status);

    List<Movie> findByFavoriteTrue();
}
